
export default function DateArrayFormatter(json_data){
      var obj = json_data;
      if (obj.length < 1) {
         console.log("Invalid");
      } else {
      var start = json_data[0].date;
      //console.log(start);
      var end = addDays(new Date(), -1);
      var count = 1;
      var firstDayThisYear = new Date(new Date().getFullYear(),0,1)
      if (start > firstDayThisYear) {
         obj.splice(0,0,{date: firstDayThisYear, count: 0});
      }
       
         while (obj[count].date < end) {
            var previousDay = addDays(obj[count-1].date, 1);
            if (+previousDay === +obj[count].date) {
               if (count === obj.length-1){
                  //break;
               }
            } else if (+previousDay < +obj[count].date) {
               obj.splice(count,0,{date: previousDay, count: 0});
            }     
            if (count >= obj.length - 1) {
                  obj.push({date: addDays(obj[count].date, 1), count: 0});
            }  
            count++;
            //console.log(count);
            //console.log(JSON.stringify(obj));
         }
      }
      //console.log(JSON.stringify(obj));
      //console.log('DateArrayFormatter');
      return obj;
}

function addDays(date, days) {
   const copy = new Date(Number(date))
   copy.setDate(date.getDate() + days)
   return copy
 }
 
 export {addDays};