let append = function(parent, type, classes) {
    let element = document.createElement(type)
    element.className = classes
    parent.appendChild(element)
    return element
}

let appendText = function(parent, text, classes) {
    append(parent, "div", classes).appendChild(document.createTextNode(text))
}

let clear = function(parent) {
    let child = parent.lastElementChild;
    while (child) {
        parent.removeChild(child);
        child = parent.lastElementChild;
    }
}

let start = function() {
    let deviceList = document.getElementById("devices")
    let status = document.getElementById("status")
    let startButton = document.getElementById("start")

    status.textContent = "Listening... talk into your microphone for best results"
    startButton.disabled = true

    let loadDevice = function(device, stream, deviceDiv) {
        let context = new AudioContext()
        let analyser = context.createAnalyser()
        analyser.fftSize = 2048
        context.createMediaStreamSource(stream).connect(analyser)
        window.setTimeout(function() {
            let array = new Float32Array(analyser.frequencyBinCount)
            analyser.getFloatTimeDomainData(array)
            let sum = 0
            for (let arrayElement of array) {
                sum += arrayElement
            }
            let value = Math.abs(sum)
            if (value < 0.02) {
                appendText(deviceDiv, "No input detected")
                deviceDiv.className = "noinput"
            }
            else {
                appendText(deviceDiv, "Input detected: " + Math.round(value * 100) / 100)
                deviceDiv.className = "input"
            }
            status.textContent = "Finished!"
            startButton.disabled = false
        }, 10000)
    }

    let loadDevices = function(devices) {
        clear(deviceList)

        for (let device of devices) {
            if (device.kind === "audioinput") {
                let deviceDiv = append(append(deviceList, "li"), "div")
                appendText(deviceDiv, device.label)

                let constraints = { audio: { deviceId: { exact: device.deviceId }}}
                navigator.mediaDevices.getUserMedia(constraints)
                    .then(stream => loadDevice(device, stream, deviceDiv), function (e) {
                        deviceDiv.className = "error"
                        appendText(deviceDiv, "Device unavailable")
                    })
            }
        }
    }
    navigator.mediaDevices.enumerateDevices().then(loadDevices)
}

load = function() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(start)
}
