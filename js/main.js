var list = Array();
var listH = Array();

var max = 10;
var maxH = 10;

var channel = null;
var subKey =  null;
var pubKey = null;
var cs = null;
var count = 0;
var highlightCount = 0;
var totalByte=0;

var highlightText = [];
var highlightText2 = [];

var Time  = new Date()
var lastTime = 0;
var timer = null;
var showOnlyHighlight = false;

var currentChannel = null;

var pubnub =null;

var pubdata = null;
var pubTime = null;
var pubstatus = null;

function dothis () {
    cs = $("#console");
    hc = $("#consoleH");

    if(channel  == null || subKey == null || channel == 'null' || subKey =='null' || channel == '' || subKey == '')
    {
        $("#status").html('<span class="label label-danger">Please Set Channel Name</span>');
        return;
    }
    

    if(currentChannel != null){
        try{
        console.log("Unsub " + currentChannel)

        pubnub.unsubscribe({
            channel: currentChannel
        })
        }catch (e){

        }
        

    }else
    {
       // ----------------------------------
    // INIT PUBNUB
    // ----------------------------------
     pubnub = PUBNUB({
        publish_key: pubKey,
        subscribe_key: subKey,
        secret_key : 'sec-c-NDE2OTBmYTctYzY5NS00YTdiLWJlZWYtNTYyMTJkZTdiMTQw',
        ssl: false,
        origin: 'pubsub.pubnub.com'
    }); 
    }
    currentChannel=channel;
    

    // ----------------------------------
    // LISTEN FOR MESSAGES
    // ----------------------------------

    console.log('subscribing')
    $("#status").html("Subscribing");
    $("#channelName").html(channel);
    pubnub.subscribe({
        restore: true,
        connect: connected,
        channel: channel,
        callback: dataProcces,
        disconnect: failed
    });

    function connected() {
        $("#status").html("Connected");
        // lastTime = Time.getTime();
        console.log('connected')
        if(timer != null)
        clearTimeout(timer);
    timer = setInterval(updateTime,500);
    }

    function failed() {
        $("#status").html("Lost");
        console.log('lost')
        //clearTimeout(timer);
    }
    

    function dataProcces(data) {
        try
        {
            var highlighted = false;
            var odata = data;

        checkPublishing(data);

        $("#status").html("Connected");
        Time = new Date();
        lastTime = Time.getTime();
        //  console.log('data : ' + data)
          totalByte += data.length;

        $("#TotalByte").html(formatSizeUnits(totalByte));
        $("#totalMsg").html(count +1);
// $("#LastTime").html(count +1);

        for (var x = 0; x < highlightText.length; x++) {
             if(highlightText[x].length ==0)
                continue;
            var hdata = replaceAll(highlightText[x], '<span class="label label-danger">' + highlightText[x] + '</span>', data);
            if(hdata != data)
            {
                highlightCount++
                highlighted = true;
            }
                

            data = hdata;
        }

        for (var x = 0; x < highlightText2.length; x++) {
            if(highlightText2[x].length ==0)
                continue;
            var hdata = replaceAll(highlightText2[x], '<span class="label label-success">' + highlightText2[x] + '</span>', data);
            if(hdata != data)
            {
              highlightCount++
              highlighted = true;  
            }
                

            data = hdata;
        }


        $("#hc").html(highlightCount);

      
            cs.prepend('<span id="c' + count + '" class="line" style="display:none"><p><span class="label label-default">' + (count +1) + '</span>' + data + '</p></span>');
            list.push(odata);
            $("#c" + count).fadeIn('slow');
            $("#c" + count).focus();
            

            if (list.length > max) {
                list.shift();
                $("#c" + (count - max)).remove();
            }
        


        if(highlighted)
        {
            hc.prepend('<span id="h' + count + '" class="line" style="display:none"><p><span class="label label-default">' + (count +1) + '</span>' + data + '</p></span>');
            listH.push(count);
             $("#h" + count).fadeIn('slow');
            $("#h" + count).focus();
           

            if (listH.length > maxH) {
                
                $("#h" + listH.shift()).remove();
            }
        }


        count++;
    }catch(e)
    {
        console.log("ERROR : " + e.message)
        console.log("ERROR : " + e.stack)
    }

    }

    function replaceAll(find, replace, str) {
        try
        {
            var repOriginal = replace;

            replace = replace.replace(find,"%%%%%")
            while (str.indexOf(find) > -1) {
                str = str.replace(find, replace);
            }
           while (str.indexOf("%%%%%") > -1) {
                str = str.replace("%%%%%", repOriginal);
            }
 
        }catch(e)
        {

        }
        
        return str;
    }
function formatSizeUnits(bytes)
{
    if ( ( bytes >> 30 ) & 0x3FF )
        bytes = ( bytes >>> 30 ) + '.' + ( bytes & (3*0x3FF )) + 'GB' ;
    else if ( ( bytes >> 20 ) & 0x3FF )
        bytes = ( bytes >>> 20 ) + '.' + ( bytes & (2*0x3FF ) ) + 'MB' ;
    else if ( ( bytes >> 10 ) & 0x3FF )
        bytes = ( bytes >>> 10 ) + '.' + ( bytes & (0x3FF ) ) + 'KB' ;
    else if ( ( bytes >> 1 ) & 0x3FF )
        bytes = ( bytes >>> 1 ) + 'Bytes' ;
    else
        bytes = bytes + 'Byte' ;
    return bytes ;
}


    // ----------------------------------
    // SEND MESSAGE
    // ----------------------------------
   

   
};

function updateTime()
{
    if (lastTime == 0)
        return;

    Time = new Date();
    var t = Time.getTime() - lastTime;
    

    $("#LastTime").html(secondsToString(Math.floor(t/1000)));

    publishingTimer();

}
function secondsToString (seconds) {

var years = Math.floor(seconds / 31536000);
var max =2;
var current = 0;
var str = "";
if (years && current<max) {
    str+= years + 'y ';
    current++;
}
var days = Math.floor((seconds %= 31536000) / 86400);
if (days && current<max) {
    str+= days + 'd ';
    current++;
}
var hours = Math.floor((seconds %= 86400) / 3600);
if (hours && current<max) {
    str+= hours + 'h ';
    current++;
}
var minutes = Math.floor((seconds %= 3600) / 60);
if (minutes && current<max) {
    str+= minutes + 'm ';
    current++;
}
var seconds = seconds % 60;
if (seconds && current<max) {
    str+= seconds + 's ';
    current++;
}

return str;
}

function getURLParameter(name) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(location.search) || [, null])[1]
    );
}

function getURLParam()
{
    var nc = getURLParameter('channel')
    if(nc != 'null')
    {
        console.log("Change channel")
        channel = nc;
    }
    var nc = getURLParameter('max')
    if(nc != 'null')
    {
        console.log("Change Max Line")
        max = nc;
    }
    var nc = getURLParameter('highlight')
    if(nc != 'null')
    {
        console.log("Change HT")
        highlightText = nc.split(",");
    }
   var nc = getURLParameter('highlight2')
    if(nc != 'null')
    {
        console.log("Change HT2")
        highlightText2 = nc.split(",");
    }

    var nc = getURLParameter('sub')
    if(nc != 'null')
    {
        console.log("Change subKey")
        subKey = nc;
    }

    var nc = getURLParameter('pub')
    if(nc != 'null')
    {
        console.log("Change pubKey")
        pubKey = nc;
    }
    var nc = getURLParameter('onlyHighlight')
    showOnlyHighlight = false;
    if(nc != 'null')
    {
        console.log("onlyHighlight Enabled " + nc)
        if(nc == 'true')
        showOnlyHighlight = true;
    }
}

function saveSettings()
{
    if(channel != null && channel != 'null')
    localStorage.channel = channel;
if(max != null && max != 'null')
    localStorage.max = max;
if(highlightText != null && highlightText != 'null')
    localStorage.highlightText=JSON.stringify(highlightText);
if(highlightText2 != null && highlightText2 != 'null')
    localStorage.highlightText2=JSON.stringify(highlightText2);
if(subKey != null && subKey != 'null')
    localStorage.subKey=subKey;
if(pubKey != null && pubKey != 'null')
    localStorage.pubKey=pubKey;

}
function loadSettings()
{
    console.log('loading Settings')
    if(localStorage.channel != undefined && localStorage.channel != null && localStorage.channel != 'null')
    {
            channel = localStorage.channel;
            $("#txtchannel").val(channel)
    }

    if(localStorage.max != undefined && localStorage.max != null && localStorage.max != 'null')
    {
        max = localStorage.max;
        $("#txtmax").val(max)
    }
    if(localStorage.highlightText != undefined && localStorage.highlightText != null && localStorage.highlightText != 'null')
    {
        try{
             highlightText=JSON.parse( localStorage.highlightText);
         }catch (e){
            highlightText = Array();
         }
   
    
    }else
    {
        highlightText = Array();
    }
    $("#txth1").val(highlightText.toString())

    if(localStorage.highlightText2 != undefined && localStorage.highlightText2 != null && localStorage.highlightText2 != 'null')
    {

      try{
             highlightText2=JSON.parse( localStorage.highlightText2);
         }catch (e){
            highlightText2 = Array();
         }

    
    }else
    {
        highlightText2 = Array();
    }
    $("#txth2").val(highlightText2.toString());

    if(localStorage.subKey != undefined && localStorage.subKey != null && localStorage.subKey != 'null')
    {
    subKey=localStorage.subKey;
    $("#txtsub").val(subKey)
    }
    if(localStorage.pubKey != undefined && localStorage.pubKey != null && localStorage.pubKey != 'null')
    {
        pubKey=localStorage.pubKey;
        $("#txtpub").val(pubKey)
    }
    // if(localStorage.showOnlyHighlight != undefined && localStorage.showOnlyHighlight != null && localStorage.showOnlyHighlight != 'null')
    // {
    //     showOnlyHighlight=localStorage.showOnlyHighlight;
    //     $("#chkHighlight").val(showOnlyHighlight)
    // }
}
function saveFromForm(){

 console.log('loading Settings from Form')
  
  var oPub = pubKey;
  var oSub = subKey;

    channel = $("#txtchannel").val();
    max = $("#txtmax").val();
    highlightText = $("#txth1").val().split(",");
    highlightText2 = $("#txth2").val().split(",");
    subKey = $("#txtsub").val();
    pubKey = $("#txtpub").val();



$('#settings').fadeOut('slow');$('#showSettings').show();
saveSettings();
loadSettings();

if(oPub != pubKey || oSub != subKey)
{
    window.location='index.html'
}else
{
    dothis();
}



}

function cancelForm()
{
    $('#settings').fadeOut('slow');$('#showSettings').show();
  loadSettings();  
}
function publish()
{
    $("#pubStatus").html('');
    if(pubnub == null || pubKey==null || pubKey =='')
    {
        $("#pubStatus").html('<span class="label label-danger">No Publication Key or Channel</span>');
        return;
    }
  
   pubdata = $("#txtcontent").val();

   if(pubdata.length ==0)
   {
     $("#pubStatus").html('<span class="label label-danger">No data</span>');
        return;
   }


        pubTime = new Date();
        $("#pubStatus").html('<span class="label label-success"> <span id="pubindata"></span><br><span id="publishedDelay">Publishing.. </span> <span id="waitingDelay"></span></span>');
        pubStatus='PUBLISHING'

        pubnub.publish({
            channel: channel,
            message: pubdata,
            callback: function (info) {
                 $("#pubindata").html(JSON.stringify(info));
                    if(pubStatus !=null)
                    {
                         var mTime = new Date();
                    var t = mTime.getTime() - pubTime.getTime();
                    pubStatus = "PUBLISHED"
                    $('#publishedDelay').html("Published in : " + secondsToString(t/1000));
                    // pubStatus = "PUBLISHED"
                    pubTime = new Date();
                    }
                   
      
            }
        });
    

}

function publishingTimer()
{
    if(pubStatus==null)
        return;
    if( pubStatus == "PUBLISHING")
     {
          var mTime = new Date();
                    var t = mTime.getTime() - pubTime.getTime();
                    $('#publishedDelay').html("Publishing : " + secondsToString(t/1000));
     }else if(pubStatus == "PUBLISHED")
     {
          var mTime = new Date();
                    var t = mTime.getTime() - pubTime.getTime();
                    $('#waitingDelay').html("Waiting : " + secondsToString(t/1000));
     }
   
}

function checkPublishing(data)
{
if(pubdata ==null || pubStatus == null)
    return;

    if(pubdata == data && (pubStatus == "PUBLISHED" || pubStatus == "PUBLISHING" ) )
    {
        if( pubStatus == "PUBLISHING")
         {
                 var mTime = new Date();
                    var t = mTime.getTime() - pubTime.getTime();
                    $('#publishedDelay').html("Publishing : " + secondsToString(t/1000));
        }

                    var mTime = new Date();
                        var t = mTime.getTime() - pubTime.getTime();
                        $('#waitingDelay').html("Recieved : " + secondsToString(t/1000));
                        pubStatus = null;
                        pubTime = null;
                        pubdata=null;
                



    }
}
function clearPub()
{
    $("#pubStatus").html('')
            pubStatus = null;
                    pubTime = null;
                    pubdata=null;
}



loadSettings();
getURLParam();
saveSettings();
loadSettings();


dothis();