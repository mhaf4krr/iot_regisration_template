const express =require("express")
const fs = require("fs")
const bodyParser = require('body-parser');
const app = express()

app.use(express.static("assets"))

app.use(bodyParser.json()); 
// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded




function writeToDisk(data){
    return new Promise((resolve,reject)=>{
        fs.writeFile(`${__dirname+"/locale/doc.txt"}`,data,function(err){
            if(err) reject(error)
            else resolve("Writing Done")
        })
    })
}


function writeToTeams(data){
    return new Promise((resolve,reject)=>{
        fs.writeFile(`${__dirname+"/locale/teams.txt"}`,data,function(err){
            if(err) reject(error)
            else resolve("Writing Done")
        })
    })
}

function readFromTeams(){
    return new Promise((resolve,reject)=>{
        fs.readFile(`${__dirname+"/locale/teams.txt"}`,"utf-8",function(err,data){
            if(err) reject(err)
            resolve(data)
            
         })
      
     })
}


 function readFromDisk(){
     return new Promise((resolve,reject)=>{
        fs.readFile(`${__dirname+"/locale/doc.txt"}`,"utf-8",function(err,data){
            if(err) reject(err)
            resolve(data)
            
         })
      
     })
 }



app.get("/list",(req,res)=>{
    let html = 
    `<html>
    <head>
    <style>
    th,td {
        padding:10px 45px;
        text-align:center;
        border: 1px solid black;
    }

    th {
        background-color:red
    }

    tr:hover {
        background-color:green;
        color:white;
    }

    table {
        border: 1px solid black;
    }
    </style>
    </head>
    <table>
    <tr>
    <th> S.NO </th>
    <th> NAME </th>
    <th> REG NO </th>
    <th> PHONE </th>
    <th> CERT </th>
    <th> EMAIL </th>
    <th> CGPA </th>
    <th> DEPT. </th>
    <th> SEM </th>
    </tr>
    <tbody>
    `

    let data_append = ""

    readFromDisk().then((stored_data)=>{
        stored_data = JSON.parse(stored_data)
        for(let i=0 ;i<stored_data.length;i++){
            data_append = data_append +
            `<tr>
            <td> ${i+1} </td>
            <td> ${stored_data[i].name}</td>
            <td> ${stored_data[i].reg}</td>
            <td> ${stored_data[i].phone} </td>
            <td> ${stored_data[i].cert}</td>
            <td> ${stored_data[i].email}</td>
            <td> ${stored_data[i].cgpa}</td>
            <td> ${stored_data[i].department}</td>
            <td> ${stored_data[i].semester}</td>
            </tr>
            `
        }

        html = html + data_append + `</tbody> </table> </body> </html>`

        res.send(html)
        
        
    })
})

app.get("/",(req,res)=>{
    res.sendFile(__dirname + "/assets/index.html")
})

app.get("/check",(req,res)=>{
    res.sendFile(__dirname + "/assets/status.html" )
})

app.post("/status",(req,res)=>{
    let reg_no = req.query.reg_no.toUpperCase()
    checkRegistration(reg_no,res)
})

app.post("/register",(req,res)=>{
   let user = req.body
   user.name = user.name.toUpperCase()
   user.reg = user.reg.toUpperCase()
 
   handleAlreadyRegistered(user,res)

  
})
app.post("/checkTeamMember",(req,res)=>{
    let reg_no = req.body.member_reg
    ifAlreadyPresentInSomeTeam(reg_no,res)
})


app.post("/registerTeam",(req,res)=>{
    console.log(req.body)
    handleTeamRegistration(req.body,res)
})

function handleTeamRegistration(send_data,res){
    readFromTeams().then((data) =>{
        let team_data
        if(data == ""){
            team_data = []
        }
        else {
            team_data = data
        }

        team_data.push(send_data)

        writeToTeams(JSON.stringify(team_data)).then((data)=>{
            res.send("registered")
        })
        
    })
}




function ifAlreadyPresentInSomeTeam(reg,res){
    readFromTeams().then((data)=>{
        let team_data
        let alreadyPresent = false
        if(data == "") {
            team_data = []
        }
        else {
            team_data = JSON.parse(data)
        }
        for(let i=0;i<team_data.length;i++){
            if(team_data[i].members.includes(`${reg}`)){
                alreadyPresent = true;
                break
            }
        }

        if(alreadyPresent){
            res.send("error:present in another team")
        }
        else {
            res.send("success")
        }
    })
}


function checkRegistration(reg,res){
    readFromDisk().then((data)=>{
        let stored_data = JSON.parse(data)
        let user
        let hasRegistered = false
        for(let i = 0 ;i < stored_data.length ;i++){
            if(stored_data[i].reg == reg){
                user = stored_data[i]
                hasRegistered = true
            }
        }

        if(hasRegistered){
            res.send(`<p style="color:green;margin-top:15px;"> <span style="color:black;font-weight:bold;"> ${user.name} </span> your registration has been done in ${user.cert} </p>`)
        }

        else {
            res.send("<p style='color:red;margin-top:15px;'> Sorry, we dont know you. </p>")
        }
    })
}


function handleAlreadyRegistered(user,res){
    readFromDisk().then((data)=>{
        let stored_data 
        if(data == ""){
            stored_data = []
        }

        else stored_data = JSON.parse(data)
        let sameUserFound = false
        for(let i = 0 ;i< stored_data.length;i++)
        {
            if(user.reg == stored_data[i].reg){
                sameUserFound = true
            }

        }

        if(sameUserFound){
            res.send(`<p style="text-align:center;"> ${user.name} Your Registration has <span style="color:red;"> Failed </span>. Already Registered </p> <script> setTimeout(()=>{
                window.location.replace("/")
            },2000) </script>`)
        }

        else {
            stored_data.push(user)

                writeToDisk(JSON.stringify(stored_data)).catch((err) => console.log(err))
                res.send(`<p style="text-align:center;"> ${user.name} Your Registration has been <span style="color:green;"> SUCCESSFUL </span>. </p> <script> setTimeout(()=>{
                    window.location.replace("/")
                },2000) </script>`)
        }
    })
}


app.listen(3000)