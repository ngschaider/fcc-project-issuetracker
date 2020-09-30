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
    app.route('/api/issues/:project')
      .get(function (req, res){
        var project = req.params.project;
        var filter = req.query;
        
        if(filter.open) {
            if(filter.open === "true") {
              filter.open = true;
            } else if(filter.open === "false") {
              filter.open = false;
            }
        }
        

        filter.project_name = project;
        console.log(filter);
        db.find(filter).toArray((err, result) => {
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

        if(!issue_title || !issue_text || !created_by) {
          res.json("missing required input");
        } else {
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

          db.insertOne(obj, {}, (err, result) => {
            obj._id = result.insertedId;
            res.json(obj);
          })
        }
      })
      
      .put(function (req, res){
        var project = req.params.project;
        const update = {
          issue_title: req.body.issue_title, 
          issue_text: req.body.issue_text, 
          created_by: req.body.created_by, 
          assigned_to: req.body.assigned_to, 
          open: req.body.open
        };

        Object.keys(update).forEach(a => {
          if(!update[a]){
            delete update[a];
          }
        });

        if(Object.keys(update).length === 0) {
          res.send("no updated fields sent");
        } else {
          update.updated_on = new Date();
          db.findOneAndUpdate({project_name: project, _id: req.body._id}, update, {}, (err, result)  => {
            if(err) {
              res.send("could not update");
            } else {
              res.send("successfully updated");
            }
          });
        }
      })
      
      .delete(function (req, res){
        const _id = req.body._id;
        const regex = /^[0-9a-fA-F]{24}$/;
        var filter = req.query;
        if(_id.match(regex) === null) {
          res.send("_id error");
        } else {
          filter.project_name = req.params.project;
          db.findOneAndDelete(filter, {}, (err, result) => {
            if(err) {
              res.send("could not delete");
            } else {
              res.send("successfully deleted");
            }
          });
        }
      });
  });
};
