/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 



module.exports = function (app) {
  MongoClient.connect(CONNECTION_STRING, {}, function(err, client) {
    if(err) throw err;    
    const db = client.db("issuetracker").collection("issues");
    console.log("registering /api/issues/:project route");
    app.route('/api/issues/:project')
      .get(function (req, res){
        var project = req.params.project;
        console.log("GET", project);
        db.find({project_name: project}).toArray((err, result) => {
          res.json(result);
        });
      })
      
      .post(function (req, res){
        var project = req.params.project;
        const issue_title = req.body.issue_title || "";
        const issue_text = req.body.issue_text || "";
        const created_by = req.body.created_by || "";
        const assigned_to = req.body.assigned_to || "";
        const status_text = req.body.status_text || "";
        const obj = {
          project_name: project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: new Date(),
          updated_on: new Date(),
          open: true,
        };

        console.log("inserting", obj);
        db.insertOne(obj, {}, (err, result) => {
          obj._id = result.insertedId;
          res.json(obj);
        })
      })
      
      .put(function (req, res){
        var project = req.params.project;
        const update = {
          issue_title: req.query.issue_title, 
          issue_text: req.query.issue_text, 
          created_by: req.query.created_by, 
          assigned_to: req.query.assigned_to, 
          open: req.query.open
        };
        update.updated_on = new Date();

        if(!update) {
          res.send("no updated fields sent");
        } else {
          db.findOneAndUpdate({project_name: project, _id: req.query.id}, update, {}, (err, result)  => {
            if(err) {
              res.send("could not update");
            } else {
              res.send("successfully updated");
            }
          });
        }
      })
      
      .delete(function (req, res){
        var project = req.params.project;
        if(!req.query.id) {
          res.send("id error");
        } else {
          db.findOneAndDelete({project_name: project, _id: req.query.id}, {}, (err, result) => {
            if(err) {
              res.send("could not update");
            } else {
              res.send("successfully updated");
            }
          });
        }
      });
  });
};
