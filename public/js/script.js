// const uploadBtn = document.querySelector('#buttonUpload');
// uploadBtn.addEventListener('click',()=>{
//     const reportDiv = document.createElement('div');
//     const image = document.createElement('img');
//     const footer = document.createElement('div');
//     reportDiv.setAttribute('class','file-card');
//     image.setAttribute('class', 'thumbnail');
//     image.setAttribute('alt','File Thumbnail');
//     console.log(file.filename);
//     if(file.mimetype.startsWith('image')){
//         image.setAttribute('src',`/uploads/${file.filename}`);
//     }
//     else if(file.mimetype === 'application/pdf'){
//         image.setAttribute('src', '/images/pdf.png');
//     }
//     else {
//         image.setAttribute('src','/images/google-docs.png');
//     }
//     footer.setAttribute('class','footer');
//     footer.innerHTML=`<p>${file.originalname}</p>`;
//     reportDiv.appendChild(image);
//     reportDiv.appendChild(footer);
//     reportList.appendChild(reportDiv);
// })


reportForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    const formData = new FormData(reportForm);
    const file = formData.get('file');

    if (file) {
        const reportDiv = document.createElement('div');
        const image = document.createElement('img');
        const footer = document.createElement('div');
        const reportList = document.querySelector('#list');

        reportDiv.setAttribute('class', 'file-card');
        image.setAttribute('class', 'thumbnail');
        image.setAttribute('alt', 'File Thumbnail');

        if (file.type.startsWith('image/')) {
            image.setAttribute('src', URL.createObjectURL(file)); // Use object URL for images
        } else if (file.type === 'application/pdf') {
            image.setAttribute('src', '/images/pdf.png');
        } else {
            image.setAttribute('src', '/images/google-docs.png');
        }

        footer.setAttribute('class', 'footer');
        footer.innerHTML = `<p>${file.name}</p>`; // Use file.name to get the original file name

        reportDiv.appendChild(image);
        reportDiv.appendChild(footer);
        reportList.appendChild(reportDiv);
        try {
            const response = await fetch('/patientDashboard/:name/upload', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('File uploaded and stored in the database:', result);
                alert('File uploaded successfully!');
            } else {
                throw new Error('Failed to upload and store the file.');
            }
        } catch (error) {
            console.error('Error uploading the file:', error);
            alert('An error occurred during file upload.');
        }
    }
});


// document.getElementById('reportF').addEventListener('submit', async function (event) {
//     event.preventDefault(); // Prevent the form from submitting in the traditional way
  
//     const fileInput = document.getElementById('file');
//     const file = fileInput.files[0];
  
//     const formData = new FormData();
//     formData.append('file', file); // Append the file to the form data
  
  
//         // Rendering the file report div after successful upload
//         const reportList = document.querySelector('#list');
//         const reportDiv = document.createElement('div');
//         const image = document.createElement('img');
//         const footer = document.createElement('div');
//         reportDiv.setAttribute('class', 'file-card');
//         image.setAttribute('class', 'thumbnail');
//         image.setAttribute('alt', 'File Thumbnail');
  
//         // Based on the file type, set the image
//         if (file.type.startsWith('image')) {
//           image.setAttribute('src', `/uploads/${result.filename}`); // Assuming the server responds with the file name
//         } else if (file.type === 'application/pdf') {
//           image.setAttribute('src', '/images/pdf.png');
//         } else {
//           image.setAttribute('src', '/images/google-docs.png');
//         }
  
//         footer.setAttribute('class', 'footer');
//         footer.innerHTML = `<p>${file.name}</p>`; // Use the file name from the front-end
  
//         reportDiv.appendChild(image);
//         reportDiv.appendChild(footer);
//         reportList.appendChild(reportDiv);
//   });


