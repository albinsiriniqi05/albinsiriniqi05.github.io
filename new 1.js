
  
/** Represents a timer that can count down. */
function CountdownTimer(seconds, tickRate) {
    this.seconds = seconds || (25*60);
    this.tickRate = tickRate || 500; // Milliseconds
    this.tickFunctions = [];
    this.isRunning = false;
    this.remaining = this.seconds;

    /** CountdownTimer starts ticking down and executes all tick
        functions once per tick. */
    this.start = function() {
        if (this.isRunning) {
            return;
        }

        this.isRunning = true;
        
        // Set variables related to when this timer started
        var startTime = Date.now(), 
            thisTimer = this;
         
        // Tick until complete or interrupted
        (function tick() {
            secondsSinceStart = ((Date.now() - startTime) / 1000) | 0;
            var secondsRemaining = thisTimer.remaining - secondsSinceStart;
            
            // Check if timer has been paused by user
            if (thisTimer.isRunning === false) {
                thisTimer.remaining = secondsRemaining;
            } else {
                if (secondsRemaining > 0) {
                    // Execute another tick in tickRate milliseconds
                    setTimeout(tick, thisTimer.tickRate);
                } else {
                    // Stop this timer
                    thisTimer.remaining = 0;
                    thisTimer.isRunning = false;

                    // Alert user that time is up
                    playAlarm();
                }
                
                var timeRemaining = parseSeconds(secondsRemaining);
                
                // Execute each tickFunction in the list with thisTimer
                // as an argument
                thisTimer.tickFunctions.forEach(
                    function(tickFunction) {
                        tickFunction.call(this, 
                                          timeRemaining.minutes, 
                                          timeRemaining.seconds);
                    }, 
                    thisTimer);
            }
        }());        
    };

    /** Pause the timer. */
    this.pause = function() {
        this.isRunning = false;
    };

    /** Pause the timer and reset to its original time. */
    this.reset = function(seconds) {
        this.isRunning = false;
        this.seconds = seconds
        this.remaining = seconds
    };

    /** Add a function to the timer's tickFunctions. */
    this.onTick = function(tickFunction) {
        if (typeof tickFunction === 'function') {
            this.tickFunctions.push(tickFunction);
        }
    };
}

/** Return minutes and seconds from seconds. */
function parseSeconds(seconds) {
    return {
        'minutes': (seconds / 60) | 0,
        'seconds': (seconds % 60) | 0
    }
}

/** Play the selected alarm at selected volume. */



function playAlarm(){
    var alarmval = document.getElementById('alarm_type').value;
    if(alarmval != 'None') {
        var alarmaudio = document.getElementById(alarmval);
        var alarmvolume = document.getElementById('volume').value;
        alarmaudio.volume = alarmvolume  / 100;
        alarmaudio.play();
    }
}

/** Window onload functions. */
window.onload = function () {
    var timerDisplay = document.getElementById('timer'),
        timer = new CountdownTimer(),
        timeObj = parseSeconds(25*60);
    
    /** Set the time on the main clock display and
        set the time remaining section in the title. */
    function setTimeOnAllDisplays(minutes, seconds) {
        if (minutes >= 60) {
            // Add an hours section to all displays
            hours = Math.floor(minutes / 60);
            minutes = minutes % 60;
            clockHours = hours + ':';
            document.title = '(' + hours + 'h' + minutes + 'm) Pomodoro';
        } else {
            clockHours = '';
            document.title = '(' + minutes + 'm) Pomodoro';
        }
        
        clockMinutes = minutes < 10 ? '0' + minutes : minutes;
        clockMinutes += ':';
        clockSeconds = seconds < 10 ? '0' + seconds : seconds;

        timerDisplay.textContent = clockHours + clockMinutes + clockSeconds;
    }
    
    /** Revert the favicon to red, delete the old timer
        object, and start a new one. */
    function resetMainTimer(seconds) {
        timer.pause();
        timer = new CountdownTimer(seconds); 
        timer.onTick(setTimeOnAllDisplays);
    }
    
    // Set default page timer displays
    setTimeOnAllDisplays(timeObj.minutes, timeObj.seconds);

    timer.onTick(setTimeOnAllDisplays);
    
    // Add listeners for start, pause, etc. buttons
    document.getElementById('start').addEventListener(
        'click', function () { 
            timer.start(); 
        });
        
    document.getElementById('pause').addEventListener(
        'click', function () {
            timer.pause(); 
        });
        
    document.getElementById('reset').addEventListener(
        'click', function () {
            resetMainTimer(timer.seconds);
            timer.start();
        });
        
    document.getElementById('pomodoro-button').addEventListener(
        'click', function () {
            resetMainTimer(25*60);
            timer.start();
        });
        
    document.getElementById('pomodoro-break').addEventListener(
        'click', function () {
            resetMainTimer(5*60);
            timer.start();
        });
        
    document.getElementById('pomodoro-long_break').addEventListener(
        'click', function () {
            resetMainTimer(15*60);
            timer.start();
        });
        
    // Bind keyboard shortcut for starting/pausing timer
    Mousetrap.bind('space', function(e) { 
        // Remove default behavior of buttons (page scrolling)
        if (e.preventDefault()) {
            e.preventDefault();
        } else {
            e.returnValue = false; //IE
        }

        // Pause or start the timer
        if(timer.isRunning) {
            timer.pause();
        } else {
            timer.start();
        }
    });
};

