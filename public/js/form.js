// function calculateAge(){
//     let birthdate = document.querySelector('.birthDate').value;
//     let dob = new Date(birthdate);
//     let today = new Date();
//     let age = today.getFullYear() - dob.getFullYear();
//     let monthDifference = today.getMonth() - dob.getMonth();
//     let dayDifference = today.getDate() - dob.getDate();
//     if(monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)){
//         age--;
// }
// let ageEntered = document.querySelector('.age').value;
// if(ageEntered === age){
//     alert('Entered age Correctly.');
//     return true;
// }
// else{
//     alert('Wrong Age entered. Enter your age correctly.');
//     return false;
// }
// }
document.getElementById('ageForm').addEventListener('submit', function(event) {
    if (!calculateAge()) {
        event.preventDefault();  // Prevent form submission if age is incorrect
    }
});

function calculateAge() {
    console.log("calculateAge function called");

    let birthdate = document.querySelector('.birthDate').value;
    let ageEntered = parseInt(document.querySelector('.age').value, 10);

    if (!birthdate || isNaN(ageEntered)) {
        alert('Please fill in all fields correctly.');
        return false;
    }

    let dob = new Date(birthdate);
    let today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    let monthDifference = today.getMonth() - dob.getMonth();
    let dayDifference = today.getDate() - dob.getDate();

    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
        age--;
    }

    if (ageEntered === age) {
        alert('Age is correct. Form will be submitted.');
        return true;
    } else {
        alert('Wrong age entered. Please enter your correct age.');
        return false;
    }
}