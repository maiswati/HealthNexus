// const submitBtn = document.querySelector('.medicineBtn');
// submitBtn.addEventListener('click', () => {
//     // e.preventDefault();
//     fetchMedicines();
// });

// function fetchMedicines() {
//     let fetchedData; // Variable to store fetched data
//     fetch('http://localhost:3000/api/get-medicines')
//         .then(response => {
//             if (!response.ok) {
//                 console.log('HTTP error, status: ' + response.status);
//                 throw new Error('Network response was not ok');
//             }
//             return response.json();
//         })
//         .then(data => {
//             fetchedData = data; // Store the data in fetchedData variable
//             console.log('Fetched data:', fetchedData); // Log the fetched data to see its structure

//             // Now process the fetchedData
//             if (fetchedData && fetchedData.length) {
//                 fetchedData.forEach(medicine => displayPillInfo(medicine));
//             } else {
//                 console.log('No medicines found.');
//             }
//         })
//         .catch(error => {
//             console.error('Error fetching medicines:', error);
//         });
// }

// function displayPillInfo(medicineData) {
//     const pillContainer = document.querySelector('.pillContainer');
//     if (!pillContainer) {
//         console.error('Error: pillContainer not found');
//         return;
//     }

//     const pillDiv = document.createElement('div'); // Create a new div for each medicine
//     pillDiv.classList.add('pillDiv'); // Ensure that each medicine gets its own div

//     const imgDiv = document.createElement('div');
//     const imgPill = document.createElement('img');
//     imgPill.setAttribute('src', '/images/pills.png'); // Adjust the image path if needed
//     imgPill.setAttribute('height', '70px');
//     imgPill.setAttribute('width', '70px');
//     imgDiv.appendChild(imgPill);

//     const infoDiv = document.createElement('div');
//     const pillname = document.createElement('h4');
//     const pilltime = document.createElement('h6');
//     const pilldose = document.createElement('h6');
//     const pillfre = document.createElement('h6');

//     // Set the text for each element
//     pillname.innerText = `Medicine: ${medicineData.medicineName}`;
//     pilltime.innerText = `Time: ${medicineData.TimeToMedicine}`;
//     pilldose.innerText = `Dosage: ${medicineData.medicineDosage}`;
//     pillfre.innerText = `Frequency: ${medicineData.frequency}`;

//     // Apply CSS classes
//     pillname.classList.add('magra-bold', 'pillname');
//     pilltime.classList.add('pillname');
//     pilldose.classList.add('pillname');
//     pillfre.classList.add('pillname');

//     // Append all the info to the infoDiv
//     infoDiv.appendChild(pillname);
//     infoDiv.appendChild(pilltime);
//     infoDiv.appendChild(pilldose);
//     infoDiv.appendChild(pillfre);

//     // Append the image and infoDiv to the pillDiv
//     pillDiv.appendChild(imgDiv);
//     pillDiv.appendChild(infoDiv);
//     pillContainer.appendChild(pillDiv); // Append the new pillDiv to the pillContainer
// }

document.querySelector('.medicineForm').addEventListener('submit', function (e) {
    e.preventDefault(); // Prevent default form submission
   let username= document.querySelector('input[name="username"]').value

    const formData = {
        medicineName: document.querySelector('input[name="medicineName"]').value,
        medicineType: document.querySelector('select[name="medicineType"]').value,
        StartDate: document.querySelector('input[name="StartDate"]').value,
        EndDate: document.querySelector('input[name="EndDate"]').value,
        TimeToMedicine: document.querySelector('input[name="TimeToMedicine"]').value,
        medicineDosage: document.querySelector('input[name="medicineDosage"]').value,
        frequency: document.querySelector('select[name="frequency"]').value
    };

    // Submit form data using AJAX
    fetch(`/patientDashboard/${username}/medicineReminder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Expecting JSON response from server
        }
        throw new Error('Failed to submit data');
    })
    .then(data => {
        if (data.success) {
            console.log('Data saved successfully:', data);

            // After submitting, fetch the updated list of medicines to render
            fetchMedicines(); // Fetch and render the updated medicine list
        }
    })
    .catch(error => {
        console.error('Error submitting data:', error);
    });
});
function fetchMedicines(user_id) {
    let fetchedData;
    fetch(`/api/get-medicines/${user_id}`)
        .then(response => {
            if (!response.ok) {
                console.log('HTTP error, status: ' + response.status);
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            fetchedData = data;
            console.log('Fetched data:', fetchedData);

            // Clear the existing pills before rendering the new data
            const pillContainer = document.querySelector('.pillContainer');
            pillContainer.innerHTML = ''; // Clear old data

            // Now process the fetched data
            if (fetchedData && fetchedData.length) {
                fetchedData.forEach(function(medicine) {
                    displayPillInfo(medicine);
                    setPillReminder(medicine);
                });
                
            } else {
                console.log('No medicines found.');
            }
        })
        .catch(error => {
            console.error('Error fetching medicines:', error);
        });
}

function displayPillInfo(medicineData) {
    const pillContainer = document.querySelector('.pillContainer');
    if (!pillContainer) {
        console.error('Error: pillContainer not found');
        return;
    }

    const pillDiv = document.createElement('div'); // Create a new div for each medicine
    pillDiv.classList.add('pillDiv'); // Ensure that each medicine gets its own div

    const imgDiv = document.createElement('div');
    const imgPill = document.createElement('img');
    imgPill.setAttribute('src', '/images/pills.png'); // Adjust the image path if needed
    imgPill.setAttribute('height', '70px');
    imgPill.setAttribute('width', '70px');
    imgDiv.appendChild(imgPill);

    const infoDiv = document.createElement('div');
    const pillname = document.createElement('h4');
    const pilltime = document.createElement('h6');
    const pilldose = document.createElement('h6');
    const pillfre = document.createElement('h6');

    // Set the text for each element
    pillname.innerText = `Medicine: ${medicineData.medicineName}`;
    pilltime.innerText = `Time: ${medicineData.TimeToMedicine}`;
    pilldose.innerText = `Dosage: ${medicineData.medicineDosage}`;
    pillfre.innerText = `Frequency: ${medicineData.frequency}`;

    // Apply CSS classes
    pillname.classList.add('magra-bold', 'pillname');
    pilltime.classList.add('pillname');
    pilldose.classList.add('pillname');
    pillfre.classList.add('pillname');

    // Append all the info to the infoDiv
    infoDiv.appendChild(pillname);
    infoDiv.appendChild(pilltime);
    infoDiv.appendChild(pilldose);
    infoDiv.appendChild(pillfre);

    // Append the image and infoDiv to the pillDiv
    pillDiv.appendChild(imgDiv);
    pillDiv.appendChild(infoDiv);
    pillContainer.appendChild(pillDiv); // Append the new pillDiv to the pillContainer
}

function setPillReminder(medicineData){
    const medicineName = medicineData.medicineName;
    const TimeToMedicine = medicineData.TimeToMedicine;
    const StartDate = medicineData.StartDate;
    const EndDate = medicineData.EndDate;
    const dosage = medicineData.medicineDosage;
    if ('Notification' in window && 'localStorage' in window) {
        Notification.requestPermission().then(function(permission) {
            if (permission !== 'granted') {
                alert('Notifications are blocked. Please allow them for reminders.');
            }
        });
    }
    if(medicineName && TimeToMedicine && StartDate && EndDate && dosage){
        localStorage.setItem('medicineReminder',JSON.stringify({medicineName,TimeToMedicine,StartDate,EndDate,dosage}));
        alert(`Reminder set for ${medicineName} at ${TimeToMedicine}`);
        checkReminderTime();
    }
    else{
        alert('Please fill out all the fields.');
    }
    function checkReminderTime(){
        setInterval(()=>{
            const reminder = JSON.parse(localStorage.getItem('medicineReminder'));
            if(reminder){
                const currentTime = new Date();
                const [reminderHour,reminderMinute] = reminder.TimeToMedicine.split(':');
                const currentDate = new Date();
                const currentDateString = currentDate.toISOString().split('T')[0];
                const currentHour = currentTime.getHours();
                const currentMinute = currentTime.getMinutes();
                if(currentDateString >= reminder.StartDate && currentDateString <= reminder.EndDate){
                    if(parseInt(reminderHour) === currentHour && parseInt(reminderMinute) === currentMinute){
                        showNotification(reminder.medicineName);
                        // if(currentDateString === reminder.EndDate){
                        //     localStorage.removeItem('medicineReminder');
                        // }
                    }
                }
            }
        },60000);
    }
    function showNotification(medicineName){
        if(Notification.permission === 'granted'){
            new Notification(`Medicine Reminder`,{
                body: `Time to take your medicine: ${medicineName} dosage: ${dosage}`,
                icon: '/images/logo.png'
            })
        }
        else{
            console.log('Notification permission is not granted.')
        }
    }
}



