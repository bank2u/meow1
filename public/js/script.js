var lblPosition = document.getElementById("lblPosition");
var imgPosition  = document.getElementById("imgPosition");
var now = new Date();
var start = new Date(now.getFullYear(), 0, 0);
var diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000);
var oneDay = 1000 * 60 * 60 * 24;
var dayOfYear = Math.floor(diff / oneDay);
var position = (dayOfYear % 6) + 1;
lblPosition.textContent = position;
imgPosition.src = "./img/" + position + ".jpg";

var lblDayOf = document.getElementById("lblDayOf");
var dateStart = dayjs('2022-08-15');
var today = dayjs();
var dayOf = today.diff(dateStart, 'day');
lblDayOf.textContent = dayOf + 1;

var txtWeight = document.getElementById("txtWeight");
var lblResult = document.getElementById("lblResult");
txtWeight.onchange = function(){
    
    if (txtWeight.value.length != 0){
        
        var weight = parseFloat(txtWeight.value);
        var doseVolume = weight*8/30;
        lblResult.textContent = doseVolume.toFixed(2);
    }
};
