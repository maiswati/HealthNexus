const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const bodyparser = require('body-parser');
const bcrypt = require('bcrypt');
const multer = require('multer')
const app=express();
app.use(express.json());
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
require('dotenv').config();



app.use(session({
    secret: "$cx`FXTjv{8SxpG", 
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production' // True only in production (HTTPS)
    }
}));

class PatientIDGenerator {
    constructor() {
        this.prefix = "HNPT"; // Using "HNPT" as the prefix
        this.year = new Date().getFullYear().toString().slice(-2); // Last two digits of the current year
        this.counter = 1; 
    }

    generatePatientID() {
      const timestamp = Date.now(); // Current timestamp in milliseconds
      const patientID = `${this.prefix}${this.year}${String(this.counter).padStart(2, '0')}-${timestamp}`;
      
      this.counter++; 
      return patientID;
    }

}
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});
passport.serializeUser((user, done) => {
  done(null, user.Id); 
});
const connection = mysql.createConnection({
  host:'localhost',
  user:'root',
  password:'MrunCS@18',
  database:'health'
});
passport.deserializeUser((Id, done) => {
  const sql = 'SELECT * FROM users WHERE Id = ?';
  connection.query(sql, [Id], (err, results) => {
    if (err) return done(err);
    done(null, results[0]); 
  });
});

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Get the file extension
    const baseName = path.basename(file.originalname, ext); // Get the file name without the extension
    const cleanBaseName = baseName.replace(/[{}]/g, '').replace(/[^a-zA-Z0-9\.\-\_]/g, ''); // Sanitize base name
    const filename = `${Date.now()}-${cleanBaseName}${ext}`; // Append the extension after sanitizing the base name

    cb(null, filename);
  }
});

const upload = multer({ storage: storage });



app.post('/patientDashboard/:username/upload', upload.single('file'), (req, res) => {
  const file = req.file;
  const username = req.params.username;
  const user_id = req.user.Id; // Ensure req.user is populated

  if (!file) {
      return res.status(400).send('No file uploaded.');
  }
  const filePath = `uploads/${file.filename}`;  // Relative path for storage
  console.log(filePath)
  const sqlquery = 'INSERT INTO patientReport (file_name, file_path, user_id, username) VALUES (?, ?, ?, ?)';
  connection.query(sqlquery, [file.originalname, filePath, user_id, username], (err, result) => {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).send('Error storing file information in the database');
      }
      
      console.log('File uploaded and file path stored in the database');
      res.render('upload',{username,user_id,reports:[]});
  });
});
app.get('/patientDashboard/:username/upload', (req, res) => {
  const username = req.params.username;
  const user_id = req.user.Id;
  const success_msg = req.query.success ? 'File uploaded successfully!' : '';
  const fetchQuery = 'SELECT * FROM patientReport WHERE user_id = ?';
  const sql = 'SELECT name, gender FROM patient WHERE user_id = ?';
  connection.query(fetchQuery, [user_id], (err, reports) => {
      if (err) {
          return res.status(500).send('Database error');
      }
      connection.query(sql , [user_id] , (err,results)=>{
        if(err){
          return res.status(500).send('Database error');
        }
        else{
          let name = results[0].name;
          console.log(reports);
          res.render('upload', { name,username, user_id, reports, success_msg });
        }
      })
  });
});



app.get('/patientDashboard/:username/uploads/:filename', (req, res) => {
  const { username, filename } = req.params;
  
  // Construct the correct file path
  const filePath = path.join(__dirname, 'uploads', filename); // Adjust if you want to add a subdirectory for each username

  res.download(filePath, (err) => {
    if (err) {
      console.error('Error downloading file:', err);

      // Send 404 response if the file is not found
      return res.status(404).send('File not found.');
    }
  });
});

app.use('/bootstrap',express.static(path.join(__dirname,'node_modules/bootstrap/dist')));
app.use(express.static(path.join(__dirname,'public')));


app.get('/',(req,res)=>{
    res.render('signup.ejs');
})
connection.connect((err)=>{
    if(err){
        console.log("Error in connecting to the database.",err);
        return;
    }
    else{
        console.log("Connected to database successfully.");
    }
})

app.post('/signup',async(req,res)=>{
    const {username, password, email, role} = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = 'INSERT INTO users (username,password,email,role) VALUES (?, ?, ?, ?)';
    connection.query(sql, [username, hashedPassword, email, role], (err, result) => {
    if (err) {
        res.status(500).send('Error saving data: ' + err);  // Corrected error handling
    } else {
        console.log("User data stored Successfully.")
        req.flash('success', 'Welcome to HealthNexus!!.');
        res.redirect('login');
    }
});
})
app.get('/login',(req,res)=>{
    const success_msg = req.flash('success');
    const error_msg = req.flash('error');
    res.render('login.ejs', { success: success_msg, error: error_msg });
})



passport.use(new LocalStrategy(
    { usernameField: 'username' }, 
    (username, password, done) => {
      const sql = 'SELECT * FROM users WHERE username = ?';
      connection.query(sql, [username], async (err, results) => {
        if (err) return done(err); 
  
        if (results.length === 0) {
          return done(null, false, { message: 'No user found with that username.' });
        }
  
        const user = results[0]; // The found user from the database
  
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          return done(null, user);
        } else {
          return done(null, false, { message: 'Invalid password' });
        }
      });
    }
  ));
  
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) {
        req.flash('error_msg', 'An error occurred: ' + err.message);
        return next(err); // Handle errors
      }
      if (!user) {
        req.flash('error_msg', 'An error occurred: ' + err.message);
        return res.redirect('/login'); // If no user found, redirect to login
      }
      req.logIn(user, (err) => {
        if (err) {
          req.flash('error_msg', 'An error occurred: ' + err.message);
          return next(err); 
        }
        const role = user.role;  
        const username = user.username; 
        
        if (role === 'patient') {
          return res.redirect(`/patientForm/${username}`);
        } else {
          return res.redirect(`/doctorForm/${username}`);
        }
      });
    })(req, res, next);
  });
  
app.get('/patientForm/:username', (req, res) => {
  const username = req.params.username;  
  res.render('patientForm', { username });  
});
  
app.get('/doctorForm/:username', (req, res) => {
  const username = req.params.username;  
  res.render('doctorForm', { username });  
});




app.post(`/patientForm/:username`,(req,res)=>{
  const {name, address, gender, phone, age, dateOfBirth, medicalBackground, medicalAllergy, severeDiagnosis} = req.body;
  const user_id = req.user.Id;
  const sqlQuery = 'INSERT INTO patient (name,address,gender,phone,age,dateOfBirth,medicalBackground,medicalAllergy,severeDiagnosis,user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sqlQuery, [name,address,gender,phone,age,dateOfBirth,medicalBackground,medicalAllergy,severeDiagnosis,user_id],(err,result)=>{
    if(err){
      res.status(500).send('Error saving dat:' + err);
    } else{
      console.log('Patient data saved Successfully.')
      req.flash('success', 'Welcome to HealthNexus!!.');
      res.redirect(`/patientDashboard/${req.params.username}`);
    }
  })
})

app.post(`/doctorForm/:username`,(req,res)=>{
  const {firstName, lastName, contact, email, license, Specialisation, experience, hospital, registrationNumber, degreeURL} = req.body;
  const user_id = req.user.Id;
  const sqlQuery = 'INSERT INTO doctor (firstName, lastName, contact, email, license, Specialisation, experience, hospital, registrationNumber, degreeURL, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
  connection.query(sqlQuery, [firstName, lastName, contact, email, license, Specialisation, experience, hospital, registrationNumber, degreeURL, user_id],(err,result)=>{
    if(err){
      res.status(500).send('Error saving dat:' + err);
    } else{
      console.log('doctor data saved Successfully.')
      req.flash('success', 'Welcome to HealthNexus, DOCTOR!!.');
      res.redirect(`/doctorDashboard/${req.params.username}`);
    }
  })
})

app.get('/doctorDashboard/:username', (req, res) => {
  const username = req.params.username;
  const user_id = req.user.Id;

  const sql = 'SELECT * FROM doctor WHERE user_id = ?';
  
  connection.query(sql, [user_id], (err, results) => {
    if (err) {
      console.log("Error fetching doctor data:", err);
      return res.status(500).send('Error fetching doctor data');
    }
    
    if (results.length > 0) {
      const firstName = results[0].firstName; 
      const lastName = results[0].lastName;
      const contact = results[0].contact;
      const email = results[0].email;
      const Specialisation = results[0].Specialisation;
      const experience = results[0].experience;
      const hospital = results[0].hospital;
      res.render('doctorDashboard', { username,firstName, lastName, contact, email, Specialisation, hospital, experience}); 
    } else {
      res.status(404).send('Doctor not found');
    }
  });
});

app.get('/patientDashboard/:username/appointementBooking',(req,res)=>{
  const username = req.params.username;
  const user_id = req.user.Id;
  const medicineQuery = 'SELECT name,age FROM patient WHERE user_id = ?';
  connection.query(medicineQuery , [user_id],(err,results)=>{
    if(err){
      return res.status(500).send('Error fetching data');
    }
    else{
      let name = results[0].name;
      let age = results[0].age;
      res.render('patientAppointement', {name , age, username} );
    }
  })

})
app.get('/doctorDashboard/:username/timeTable',(req,res)=>{
  const username = req.params.username;
  const user_id = req.user.Id;
  const sql = 'SELECT * FROM doctor WHERE user_id = ?';
  
  connection.query(sql, [user_id], (err, results) => {
    if (err) {
      console.log("Error fetching doctor data:", err);
      return res.status(500).send('Error fetching doctor data');
    }
    
    if (results.length > 0) {
      const firstName = results[0].firstName; 
      const lastName = results[0].lastName;
      const contact = results[0].contact;
      const email = results[0].email;
      const Specialisation = results[0].Specialisation;
      const experience = results[0].experience;
      const hospital = results[0].hospital;
      res.render('timeTable', { username,firstName, lastName, contact, email, Specialisation, hospital, experience}); 
    } else {
      res.status(404).send('Doctor not found');
    }
  });
})
app.get('/doctorDashboard/:username/todayAppointement',(req,res)=>{
  const username = req.params.username;
  const user_id = req.user.Id;
  const sql = 'SELECT * FROM doctor WHERE user_id = ?';
  
  connection.query(sql, [user_id], (err, results) => {
    if (err) {
      console.log("Error fetching doctor data:", err);
      return res.status(500).send('Error fetching doctor data');
    }
    
    if (results.length > 0) {
      const firstName = results[0].firstName; 
      const lastName = results[0].lastName;
      const contact = results[0].contact;
      const email = results[0].email;
      const Specialisation = results[0].Specialisation;
      const experience = results[0].experience;
      const hospital = results[0].hospital;
      res.render('Appointement', { username,firstName, lastName, contact, email, Specialisation, hospital, experience}); 
    } else {
      res.status(404).send('Doctor not found');
    }
  });
})
app.get('/patientDashboard/:username', (req, res, next) => {
  const username = req.params.username;
  const idGenerator = new PatientIDGenerator();
  const patientID = idGenerator.generatePatientID();
  const user_id = req.user.Id;

  const sql = 'SELECT name, gender FROM patient WHERE user_id = (SELECT Id FROM users WHERE username = ?)';

  // Fetch patient's name and gender
  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.log("Error fetching patient data:", err);
      return res.status(500).send('Error fetching patient data');
    }

    if (results.length > 0) {
      const name = results[0].name;
      const gender = results[0].gender;

      // Determine the image source based on gender
      let imageSrc;
      if (gender === 'Female') {
        imageSrc = "/images/Female.png";
      } else if (gender === 'Male') {
        imageSrc = "/images/Male.png";
      }

      // Fetch medicines for the patient
      const sqlQuery = 'SELECT * FROM medicine WHERE user_id = ?';
      connection.query(sqlQuery, [user_id], (err, medicines) => {
        if (err) {
          return next(err);
        }
        // Render the patient dashboard with the image source and other details
        res.render('patientDashboard', {
          patientID,
          name,
          gender,
          imageSrc, // Pass the image source to the view
          medicines // Pass the medicines array to the view
        });
      });
    } else {
      return res.status(404).send('Patient not found');
    }
  });
});






app.get('/patientDashboard/:username/medicineReminder',(req,res)=>{
  const username = req.params.username;
  const user_id = req.user.Id;
  const medicineQuery = 'SELECT name,age FROM patient WHERE user_id = ?';
  const fetchMedicineQuery = 'SELECT * FROM medicine WHERE user_id = ?';
  connection.query(medicineQuery,[user_id],(err,patientResults)=>{
    if(err){
      return res.status(500).send('Error fetching patient details:' + err);
    }
    if(patientResults.length === 0){
      return res.status(404).send('Patient Not found');
    }
    let name = patientResults[0].name;
    let age = patientResults[0].age;
    connection.query(fetchMedicineQuery,[user_id],(err,medicines)=>{
      if(err){
        return res.status(500).send('Error fetching medicines'+err);
      }
      res.render('medicineReminder',{
        name:name,
        age:age,
        username:username,
        medicines:medicines
      })
    })
  })
})


app.get('/api/get-medicines/:user_id', (req, res) => {
  const user_id = req.user.Id;

  let query = 'SELECT * FROM medicine WHERE user_id = ?';

  connection.query(query, [user_id], (err, results) => {
      if (err) {
          return res.status(500).json({ error: 'Error fetching medicines: ' + err });
      }

      res.status(200).json(results); // Send the medicines of the specific user
  });
});


app.get('/download/:fileName', (req,res)=>{
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname,'uploads',fileName);
  res.download(filePath, fileName,(err)=>{
    if(err){
      console.error('Error during file download:',err);
      req.flash('error_msg', 'Error downloading the file.Please try again.');
    }
    else{
      console.log('File downloaded successfully',fileName);
      req.flash('success_msg',`File ${fileName} dowload successfully`);
    }
  })
})


app.post('/patientDashboard/:username/medicineReminder', (req, res) => {
  const user_id = req.user.Id;
  const username = req.params.username;
  const { medicineName, medicineType, StartDate, EndDate, TimeToMedicine, medicineDosage, frequency } = req.body;

  let medicinePostQuery = `
      INSERT INTO medicine (username, medicineName, medicineType, StartDate, EndDate, TimeToMedicine, medicineDosage, frequency, user_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  connection.query(medicinePostQuery, [username, medicineName, medicineType, StartDate, EndDate, TimeToMedicine, medicineDosage, frequency, user_id], (err, result) => {
      if (err) {
          res.status(500).json({ error: 'Error saving data: ' + err });
      } else {
          console.log('Medicine Data saved successfully.');
          res.status(200).json({ message: 'Medicine Saved', success: true }); // Send a JSON response
      }
  });
});



app.get('/profile/:username', (req, res) => {
  const username = req.params.username;  // Capture the username from the URL
  console.log(`Fetching profile for username: ${username}`);  // Debugging log

  // Your SQL query to fetch patient data using the username
  const sql = 'SELECT * FROM patient WHERE user_id = (SELECT Id FROM users WHERE username = ?)';
  
  connection.query(sql, [username], (err, results) => {
    if (err) {
      console.error("Error fetching patient data:", err);  // Debugging log for error
      return res.status(500).send('Error fetching patient data');
    }
    
    if (results.length > 0) {
      const name = results[0].name;
      console.log(`Patient found: ${name}`);  
      res.render('profile', { name });  
    } else {
      console.log('No patient found with username:', username); 
      res.status(404).send('Patient not found');
    }
  });
});






const port = 3000;
app.listen(3000, 'localhost', () => {
  console.log('Server is running on localhost:3000');
});















