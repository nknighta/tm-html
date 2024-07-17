const URL = "https://teachablemachine.withgoogle.com/models/bvkUkni6a/";

let model, webcam, labelContainer, maxPredictions;

// Load the image model and setup the webcam
async function init() {
    document.getElementById("webcam-container").innerHTML = "読み込み中..." + "<br/>";
    document.getElementById("webcam-container").style.fontSize = "30px";
    try {

        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        // load the model and metadata
        // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
        // or files from your local hard drive
        // Note: the pose library adds "tmImage" object to your window (window.tmImage)
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        // Convenience function to setup a webcam
        webcam = new tmImage.Webcam(400, 350, true);
        await webcam.setup(); // request access to the webcam
        await webcam.play();
        window.requestAnimationFrame(loop);

        // append elements to the DOM
        document.getElementById("webcam-container").innerHTML = "";
        document.getElementById("webcam-container").appendChild(webcam.canvas);
        labelContainer = document.getElementById("label-container");
        for (let i = 0; i < maxPredictions; i++) { // and class labels
            labelContainer.appendChild(document.createElement("div"));
        }
    } catch (e) {
        console.log(e);
        document.getElementById("webcam-container").innerHTML = "!カメラの許可をお願い致します。";
    }
}

async function loop() {
    webcam.update(); // update the webcam frame
    await predict();
    window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
    // predict can take in an image, video or canvas html element
    const prediction = await model.predict(webcam.canvas);
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
        
        if (prediction[0].probability.toFixed(2) > 0.85) {
            document.getElementById("label-container").style.display = "none";
            document.getElementById("color-container").style.transition = "all 0.08s";
            document.getElementById("color-container").innerHTML = prediction[0].className;
            document.getElementById("color-container").innerHTML = "車いす";
        } else {
            document.getElementById("label-container").style.display = "none";
            document.getElementById("color-container").innerHTML = "";
            document.getElementById("color-container").style.transition = "all 0.1s";
        }
    }
}

window.onload = init();
