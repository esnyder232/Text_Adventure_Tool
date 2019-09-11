//import {computedFrom} from 'aurelia-framework';


export class TextAdventureTool {
  constructor()
  {
    this.saveFile = "";
    this.saveFileName = "";
    this.newDetails();

    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
    } else {
      alert('The File APIs are not fully supported in this browser.');
    }
  }

  attached()
  {
    console.log('attacheted!')
    document.addEventListener("keydown", (e) => {
      if(e.ctrlKey)
      {
        if(e.keyCode == 83) //s key
        {
          e.preventDefault();
          this.saveDetails();
        }
      }
      return true;
    })
  }

  newDetails()
  {
    this.main = this.createBlankTemplate();
    this.loadDetails()
  }

  loadDetails()
  {
    this.loadDetailObjects(this.main);
  }
  
  saveDetails()
  {
    this.saveDeleteDetailObjects(this.main, null);

    //download the data as json
    this.saveFile = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.main));
    this.saveFileName = this.main.vName ? this.main.vName + ".json" : "gameData.json";
    window.setTimeout(() => {
      $('#saveLink')[0].click();
    }, 50);

    //reload the data
    this.loadDetails();
  }

  loadExternalData()
  {
    $("#externalFileButton").click();
  }

  readExternalFile(event)
  {
    var userFile = document.getElementById('externalFileButton');
    var extFile = userFile.files[0];    
    console.log("Attempting to get file " + extFile.name + "...");
    
    var fileReader = new FileReader();
    fileReader.addEventListener('load', (theFile) => {
      try
      {
        //do stuff with fileReader.result
        console.log("File is found! Now parsing json...");
        var test = JSON.parse(theFile.target.result);
        this.main = test;
        this.loadDetails();
      }
      catch(ex)
      {
        console.log("Exception caught when trying to parse external file: " + ex)
      }
    });
    fileReader.readAsText(extFile);
  }

  readJSON(path) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', path, true);
    xhr.responseType = 'blob';
    xhr.onload = function(e) { 
      if (this.status == 200) {
          var file = new File([this.response], 'temp');
          var fileReader = new FileReader();
          fileReader.addEventListener('load', function(){
               //do stuff with fileReader.result
          });
          fileReader.readAsText(file);
      } 
    }
    xhr.send();
}


  createBlankTemplate() {
    var ret = {
      rooms: [],
      items: [],
      playerActions: []
    };
    return ret;
  }


  toggleShowDetails(record)
  {
    if(!record.bShowDetails)
      record.bShowDetails = true;
    else
      record.bShowDetails = false;
  }

  addGenericDetail(parent, customJson)
  {
    var template = {};
    if(parent.length > 0)
    {
      template = parent[0];
    }

    //create new object that mirrors the template
    var newObj = JSON.parse(JSON.stringify(template));
    this.clearObjectProperties(newObj);

    newObj.action = "I";
    newObj.isDirty = 1;

    //fill in new object with customJson data if there is any
    if(typeof customJson === 'object' && customJson !== null)
    {
      for(var key in customJson)
      {
        if(customJson.hasOwnProperty(key))
        {
          newObj[key] = customJson[key];
        }
      }
    }
    
    // console.log('new obj:')
    // console.log(newObj);
    parent.push(newObj);

  }


  //recursive function. Updates all objects in all arrays with the following rules:
  //If one of the properties is an array, it calls it itself recursively for each object
  //If one of the properties is an object, check if it has a property called 'action' on it:
  //-- if action is 'I', update action to 'U' and update isDirty to 0.
  //-- if action is 'U', update isDirty to 'U' and update isDirty to 0.
  //-- if action is 'D', leave it as 'D' and update isDirty to 1.
  loadDetailObjects(obj, parent)
  {
    for(var key in obj)
    {
      if(obj.hasOwnProperty(key))
      {
        if(Array.isArray(obj[key]))
        {
          for(var i = obj[key].length - 1; i >= 0; i--)
          {
            this.loadDetailObjects(obj[key][i], obj[key]);
          }
        }
        //if the value is an object
        else if(typeof obj[key] === 'object' && obj[key] !== null)
        {
          this.loadDetailObjects(obj[key], obj[key]);
        }
        else if(key == 'action')
        {
          if(obj[key] == 'I')
          {
            obj[key] = 'U';
            obj.isDirty = 0;
          }
          else if(obj[key] == 'U')
          {
            obj[key] = 'U';
            obj.isDirty = 0;
          }
          else if (obj[key] == 'D')
          {
            obj[key] = 'D';
            obj.isDirty = 1;
          }
        }
      }
    }
  }



  //recursive function. Updates all objects in all arrays with the following rules:
  //If one of the properties is an array, it calls it itself recursively for each object
  //If one of the properties is an object, check if it has a property called 'action' on it:
  //-- if action is 'D', splice it off.
  //-- if action is 'I', change it to 'U'
  //-- if action is 'U', leave it as 'U'
  saveDeleteDetailObjects(obj, parent)
  {
    for(var key in obj)
    {
      if(obj.hasOwnProperty(key))
      {
        if(Array.isArray(obj[key]))
        {
          for(var i = obj[key].length - 1; i >= 0; i--)
          {
            this.saveDeleteDetailObjects(obj[key][i], obj[key]);
          }
        }
        //if the value is an object
        else if(typeof obj[key] === 'object' && obj[key] !== null)
        {
          this.saveDeleteDetailObjects(obj[key], obj[key]);
        }
        else if(key == 'action')
        {
          if (obj[key] == 'D')
          {
            var index = parent.indexOf(obj);
            parent.splice(index, 1);
            return;
          }
        }
      }
    }
  }


  //recursive function. Clears out all properties on object.
  //If one of the properties is an array, it creates a blank array
  //If one of the properties is an object, it calls it itself recursively for each object 
  clearObjectProperties(newObj)
  {
    for(var key in newObj)
    {
      if(newObj.hasOwnProperty(key))
      {
        if(Array.isArray(newObj[key]))
        {
          //make a blank array
          newObj[key] = [];
        }
        //if the value is an object
        else if(typeof newObj[key] === 'object' && newObj[key] !== null)
        {
          this.clearObjectProperties(newObj[key]);
        }
        //this value is just a primitive value. Make it null.
        else
        {
          newObj[key] = null;
        }
      }
    }
  }

  roomNameChanged(room)
  {
    for(var i = 0; i < room.roomConnections.length; i++)
    {
      room.roomConnections[i].vRoom = room.vName;
      room.roomConnections[i].isDirty = 1;
    }

    for(var i = 0; i < room.roomItems.length; i++)
    {
      room.roomItems[i].vRoom = room.vName;
      room.roomItems[i].isDirty = 1;
    }

    for(var i = 0; i < room.itemInteractions.length; i++)
    {
      room.itemInteractions[i].vRoom = room.vName;
      room.itemInteractions[i].isDirty = 1;
    }
  }

  deleteGenericDetail(parent, record)
  {
    var index = parent.indexOf(record);

    //I = insert
    if(record.action == "I")
    {
      parent.splice(index, 1);
    }
    //U = update
    else if(record.action == "D")
    {
      record.action = "U";
    }
    //D = delete or null = delete
    else
    {
      record.action = "D";
    }
  }

  getDetailActionClass(record)
  {
    var ret = "";
    if(record.action == "I")
    {
      ret = "markedForInsert";
    }
    else if(record.action == "D")
    {
      ret = "markedForDelete";
    }
    else
    {
      ret = "markedForUpdate";
    }
    return ret;
  }

  getDetailActionLabel(record)
  {
    var ret = "";
    if(record.action == "I")
    {
      ret = "(New)";
    }
    else if(record.action == "D")
    {
      ret = "(Marked for delete)";
    }
    else
    {
      ret = "(Updated)";
    }
    return ret;
  }


}
