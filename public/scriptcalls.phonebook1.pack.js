$('input#txtDOB.dob')
    .attr('readonly', true)
    .focusin(function(e){
        if(!$(this).val()){
            var toDate=(new Date());
            $(this).val(('0'+toDate.getMonth().toString()).substr(-2)+'/'+('0'+toDate.getDate().toString()).substr(-2)+'/'+toDate.getFullYear());
        }
        $(this).datepicker({
            minDate: "-100Y",
            maxDate: "0",
            dateFormat: "mm/dd/yy",
            yearRange: "-65:-0",
            showAnim: "fadeIn",
            changeMonth: true,
            changeYear: true
        });
    });
