/**
 * Created by zhaolongwei on 17/6/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let async = require('async');
let expect = chai.expect;
let should = chai.should();

let loginSuccess = require('./login').loginSuccess;

let login = require('./login.spec');
let logSearch = require('./logSearch.spec');
let userManager = require('./userManager.spec');
let orgManager = require('./orgManager.spec');

chai.use(chaiHttp);

loginSuccess((json) => {
  //任务列表
  let auto = [
    (cb) => {
      login(json, () => {
        cb();
      });
    },
    (cb) => {
      logSearch(json, () => {
        cb();
      });
    },
    (cb) => {
      userManager(json, () => {
        cb();
      });
    },
    (cb) => {
      orgManager(json, () => {
        cb();
      });
    }
  ];

  async.auto(auto, (err, results) =>  {
    //console.log(err, results)
  });
});