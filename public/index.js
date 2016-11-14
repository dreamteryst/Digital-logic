$(function(){
	// check logged in
	firebase.auth().onAuthStateChanged(firebaseUser => {
		if(!firebaseUser) {
			window.location = "login.html";
		}
	});

	var updates = {};
	var BreakException = {};
	var now = new Date();
	var first = true;
	var database = firebase.database().ref().child('setting');

	var status = $("#status"),
		countdown = $("#countdown"),
		settime = $("#settime"),
		hour = $("input[name='hour']"),
		minute = $("input[name='minute']"),
		time = $("input[name='time']"),
		date = $("select[name='date']"),
		btnOn = $("#btnOn"),
		btnOff = $("#btnOff");

	// global values
	var _hour=null,_minute=null,_time=null,_date=null,_fMinute=null;
	var weekday = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

	database.on("value",snap => {
		var val = snap.val();
		//init global
		_hour = val.hour;
		_minute = val.minute;
		_time = val.time;
		_date = val.date;

		// set value in editor
		hour.val(_hour);
		minute.val(_minute);
		time.val(_time);
		date.val(_date);

		//first check datetime
		if(first)
		{
			first = false;
			try {
				_date.forEach(function(value,key){
					now = new Date();
					if(now.getDay() == value)
					{
						check_time(false);
						check_time(true);
						throw BreakException;
					}else{
						check_time(false);
					}
				});
			} catch (e) {
			  if (e !== BreakException) throw e;
			}
		}

		// set value in view
		countdown.html(_hour+" ชม. "+_minute+" นาที");
		var TempTime = "เวลา "+_time+" น. วัน ";
		_date.forEach(function(value,key){
			TempTime = TempTime+weekday[value]+", ";
		});
		settime.html(TempTime);
		if(val.forMCU)
		{
			status.html("ON");
			btnOff.removeClass("active");
			btnOn.addClass("active");
		}else{
			status.html("OFF");
			btnOff.addClass("active");
			btnOn.removeClass("active");
		}
	});

	$("#btnLogout").click(function(){
		firebase.auth().signOut();
	});

	$("#setCount").click(function(){
		updates['hour'] = hour.val();
		updates['minute'] = minute.val();
		database.update(updates);
		_fMinute = (hour.val()*60)+minute.val()*1;
		//countdown
		if(hour.val() > 0 || minute.val() > 0)
		{
			setTimeout(function(){calTime();},1000);
		}

	});

	$("#setDate").click(function(){
		updates['time'] = time.val();
		updates['date'] = date.val();
		database.update(updates);
		try {
			date.val().forEach(function(value,key){
				now = new Date();
				if(now.getDay() == value)
				{
					check_time(false);
					check_time(true);
					throw BreakException;
				}else{
					check_time(false);
				}
			});
		} catch (e) {
		  if (e !== BreakException) throw e;
		}
	});

	btnOn.click(function(){
		set_MCU_on();
	});

	btnOff.click(function(){
		set_MCU_off();
	});

	function calTime()
	{
		_fMinute--;
		if(_fMinute > 0)
		{
			updates['hour'] = parseInt(_fMinute/60);
			updates['minute'] = parseInt(_fMinute%60);
			database.update(updates);
			setTimeout(function(){calTime();},1000);
		} else {
			updates['hour'] = 0;
			updates['minute'] = 0;
			database.update(updates);
			set_MCU_on();
			setTimeout(function(){set_MCU_off();},10000);
		}
	}

	function set_MCU_on()
	{
		database.child('forMCU').set(true);
		btnOff.removeClass("active");
		btnOn.addClass("active");
	}

	function set_MCU_off()
	{
		database.child('forMCU').set(false);
		btnOff.addClass("active");
		btnOn.removeClass("active");
	}

	var idxTime = 0;
	function check_time(hasCheck)
	{
		if(hasCheck)
		{
			now = new Date();
			var eTime = _time.split(",");
			if(typeof(eTime[idxTime]) != "undefined")
			{
				console.log(eTime[idxTime]);
				if(eTime[idxTime] == now.getHours()+":"+now.getMinutes())
				{
					idxTime++;
					set_MCU_on();
					setTimeout(function(){set_MCU_off();check_time(false);},10000);
				}else if(eTime[idxTime] > now.getHours()+":"+now.getMinutes()){
					setTimeout(function(){check_time(true);},10000);
				} else {
					idxTime++;
					setTimeout(function(){check_time(true);},10000);
				}
			} else {
				idxTime = 0;
			}
		}
	}

	// for initialization
	updateTime();
	function updateTime()
	{
		now = new Date();
		var timeNow = now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()+" น. วัน "+weekday[now.getDay()];
		$("#datenow").html(timeNow);
		setTimeout(function(){updateTime();},1000);
	}

});