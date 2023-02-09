// ==UserScript==
// @name         IB Notify
// @namespace    trans-logistics.amazon.com
// @version      0.4
// @description  pop up notification for new manifests to prevent user from missing important updates
// @author       garbosz@
// @match        https://trans-logistics.amazon.com/ssp/dock/*
// @match        https://trans-logistics-eu.amazon.com/ssp/dock/*
// @match        https://trans-logistics.amazon.com/ssp/dock/ib
// @grant        GM_notification
// @run-at document-end
// ==/UserScript==

let processed=[];
  var resetButton = document.createElement("button");
  resetButton.innerHTML = "Reset";
  resetButton.style.padding = "10px 20px";
  resetButton.style.backgroundColor = "#4CAF50";
  resetButton.style.color = "white";
  resetButton.style.border = "none";
  resetButton.style.borderRadius = "4px";
  resetButton.style.cursor = "pointer";
  resetButton.style.marginRight = "10px";
  document.body.appendChild(resetButton);

  resetButton.addEventListener ("click", function() {
    processed = [];
    console.log("Processed array reset to empty:", processed);
  });

  var testButton = document.createElement("button");
  testButton.innerHTML = "Test";
  testButton.style.padding = "10px 20px";
  testButton.style.backgroundColor = "#4CAF50";
  testButton.style.color = "white";
  testButton.style.border = "none";
  testButton.style.borderRadius = "4px";
  testButton.style.cursor = "pointer";
  document.body.appendChild(testButton);

  testButton.addEventListener ("click", function() {
  var dataTable = fetchData();//get data build table
  var data=getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
  //window.focus();
  //displayPopup(data);
  //notifyMe(data);
  });
// Function to display the pop-up dialog box
setTimeout(5000);

function displayPopup(vol) {
    if(vol.textContent > 0){
    var current = new Date();
    alert("New Manifest! @"+current.toLocaleTimeString()+"\nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent);
    }
}

function notifyMe(vol) {
    if(vol.textContent > 0){
    var current = new Date();
    if ('Notification' in window) {
  Notification.requestPermission().then(function(permission) {
    if (permission === "granted") {
      var notification = new Notification("New Manifest!", {
        body: "detected @"+current.toLocaleTimeString()+" \nVRID: "+vol.firstChild.dataset.vrid+"\nVolume on board: "+vol.textContent,
        requireInteraction: true
      });
    }
  });
} else {
  console.log("This browser does not support notifications.");
}
}
}
function fetchData() {
  var vol = document.getElementsByClassName("inTrailerP");
    console.log(vol)
    console.log(vol[0].textContent)//this is the volume
    console.log(vol[0].firstChild.dataset.vrid)//this is the VRID
 var dashboardElement=vol

  return dashboardElement;
}

function getVolumeData(vol) {
  let output = [];
  const maxLength = 30;
  for (let i = 0; i < vol.length; i++) {
    if (vol[i].textContent.trim().length > 0 && !processed.includes(vol[i].firstChild.dataset.vrid)) {
      output.push([vol[i].firstChild.dataset.vrid, vol[i].textContent.trim()]);
      processed.push(vol[i].firstChild.dataset.vrid);
        console.log(vol[i]);
      if (processed.length > maxLength) {
        processed.shift();
          console.log(processed);
      }
      window.blur();
      window.focus();
      notifyMe(vol[i]);
      displayPopup(vol[i]);
      break;
    }
  }
}

// Fetch the data every 5 minutes
setInterval(function() {
  var dataTable = fetchData();//get data build table
  var data=getVolumeData(dataTable)//chug through data if new manifest found, add to blacklist and call popup
 // window.focus();
 // displayPopup(data);
   // notifyMe(data);
}, 300000); // 5 minutes in milliseconds
//}, 3000); // 3 seconds in milliseconds for testing
