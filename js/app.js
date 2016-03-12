var db;


//function returns timestamp
function dtFormat() {
    var date = new Date();
var timeStamp = date.toLocaleString();
return timeStamp;
} //end of date function

//------------------------------------------------------------------------------------------------------------

$(document).ready(function() {

	//check for indexedDb support
            if(!("indexedDB" in window)) {
                alert("IndexedDB support required for this demo!");
                return;
            }
	
	var $noteDetails = $("#noteDetails");
	var $noteForm = $("#noteForm");

   //request indexedDB
	var openRequest = window.indexedDB.open("Project-1-DB",1);

//display error in console of any
            openRequest.onerror = function(e) {
                console.log("Error opening db");
                console.dir(e);
            };

//execute loop on successful DB creation
            openRequest.onupgradeneeded = function(e) {
                console.log("IndexedDB created successfully");
                var thisDb = e.target.result;
                var objectStore;
               
                if(!thisDb.objectStoreNames.contains("note")) {
                   objectStore = thisDb.createObjectStore("note", { keyPath: "id", autoIncrement:true });  
                   objectStore.createIndex("name", "name", { unique: false });
                   objectStore.createIndex("characters", "characters", { unique: false });
                   console.log("Creating 'note' objectSTore");
                   
            }

            }; //close openRequest.onupgradeneeded()
      
 //handling generic errors
            openRequest.onsuccess = function(e) {
                db = e.target.result;
                db.onerror = function(event) {
               alert("Database error: " + event.target.errorCode);
                console.dir(event.target);
                }; //end db.onerror()

                displayNotes();

            }; //end openRequest()

        //---------------------------------------


    function displayNotes() {

        var transaction = db.transaction(["note"], "readonly");  
       var store = transaction.objectStore("note");
		var countRequest = store.count();
		
        //getting number of notes
        countRequest.onsuccess = function(){display+= "<h2 style=text-align:center;> Number of notes:  "+countRequest.result+ "</h2><br/><br/>"};
        var display="<table align='center'; class='table table-collapse'><thead><tr><th>SUBJECT</th><th>TIMESTAMP</th><th>CHARACTERS IN BODY</th>;</td></thead><tbody>";

		transaction.oncomplete = function(event) {
            $("#listOfNotes").html(display); //displaying number of notes
        };

//display the notes table
        var handleResult = function(event) { 
          var pointer = event.target.result;  
          if (pointer) {  
              
            display += "<tr data-key=\""+pointer.key+"\"><td  class=\"notetitle\">"+pointer.value.title+"</td>";
            display += "<td>"+dtFormat(pointer.value.updated)+"</td><td align='center' >"+pointer.value.characters+"</td>";
            display += "<td><a class=\"btn btn-danger delete\">Delete</a></td></tr>";
             pointer.continue();  
          }  
          else {  
            display += "</tbody></table>";
          }  
        };  

        var objectStore = transaction.objectStore("note");

		objectStore.openCursor().onsuccess = handleResult;
    
    } //end of displayNotes()
    
    
    //----------------------------------------------------------------------------------------------

//add a note object
	$("#addButton").on("click", function(e) {
		$("#title").val("");
		$("#body").val("");
        $("#key").val("");
       $("#name").val("");
       $("#characters").val("");
		$noteDetails.hide();
		$noteForm.show();	
       	
	});
	
    //-------------------------------------------
    //display a note object

    $("#listOfNotes").on("click", "td", function() {
        var thisId = $(this).parent().data("key");
        var transaction = db.transaction(["note"]);  
        var objectStore = transaction.objectStore("note");  
        var request = objectStore.get(thisId);  
       
		request.onsuccess = function(event) {  
			var note = request.result;
           $noteDetails.html("<h3> Author: "+note.name+"</h3><p> <h3>Subject:"+note.title+"</h3></p><p><h3> Number of Characters: "+note.characters+"</h3></p><p><h3> Date and Time:"+note.updated+"</h3></p><p><h3> Message: "+note.body+"</h3></p>").show();
			$noteForm.hide();
            
        };  
    });

//--------------------------------------------------


//save a note object  
    $("#saveButton").on("click",function() {

        var title = $("#title").val();
        var body = $("#body").val();
       var key = $("#key").val();
       var name = $("#name").val();
       var length = body.length;
       var t = db.transaction(["note"], "readwrite");
		
        if(key === "") {
            t.objectStore("note")
                            .add({title:title,body:body,name:name,characters:length,updated:new Date()});
        } else {
            t.objectStore("note")
                            .put({title:title,body:body,name:name,characters:length,updated:new Date(),id:Number(key)});
        }

		t.oncomplete = function(event) {
            $("#key").val("");
            $("#title").val("");
            $("#body").val("");
            $("#name").val("");
            $("#characters").val("");
            displayNotes();
			$noteForm.hide();
         	$('#myModal').modal('hide');		
		};

        return false;
    });
    
    //---------------------------------------------------
    
    
//delete a note object
    $("#listOfNotes").on("click", "a.delete", function(e) {
        var thisId = $(this).parent().parent().data("key");

		var t = db.transaction(["note"], "readwrite");
		var request = t.objectStore("note").delete(thisId);
		t.oncomplete = function(event) {
			displayNotes();
			$noteDetails.hide();
			$noteForm.hide();
              
		};
        return false;
    });

}); //end of $(document).ready(function()

