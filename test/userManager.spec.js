/**
 * Created by zhaolongwei on 17/6/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let async = require('async');
let expect = chai.expect;
let should = chai.should();

let config = require('./config');
let loginSuccess = require('./login').loginSuccess;

chai.use(chaiHttp);

module.exports = function({userInfo, token, loginParams, baseUrl}, exportCallback){
  let request = null;
  beforeEach(() => {
    request = chai.request(baseUrl);
  });
  describe('用户查询——正常', ()=> {
    describe('GET /user/list', ()=> {
      let params = {keyword:'', page: 1, size: 10 }
      it('should searchSuccess', (done) => {
        let ajax = request.get('/user/list')
        .set('x-auth-token', token)
        .query(params)
        .end((err, resp) => {
          resp.should.have.status(200);
          resp.body.should.be.a('object');

          let body = resp.body;
          body.should.have.property('datas');
          let datas = body.datas;
          datas.should.have.property('page');
          datas.page.should.equal(params.page);
          datas.should.have.property('total');
          datas.should.have.property('pageList');
          datas.pageList.length.should.above(0);

          done();
        });
      });
    });
  });

  describe('用户查询——正常-keyword', ()=> {
    describe('GET /user/list', ()=> {
      let params = {keyword: loginParams.username, page: 1, size: 10 }
      it('should searchSuccess', (done) => {
        let ajax = request.get('/user/list')
        .set('x-auth-token', token)
        .query(params)
        .end((err, resp) => {
          resp.should.have.status(200);
          resp.body.should.be.a('object');

          let body = resp.body;
          body.should.have.property('datas');
          let datas = body.datas;
          datas.should.have.property('page');
          datas.page.should.equal(params.page);
          datas.should.have.property('total');
          datas.should.have.property('pageList');
          datas.pageList.length.should.above(0);

          done();
        });
      });
    });
  });

  let addUser = (callback) => {
    describe('新增用户', ()=> {
      describe('POST /user/add', ()=> {
        let time = new Date().getTime();
        let params = {
          email: time + '@yonyou.com',
          headImage: '',
          realName: 'test' + time,
          userName: 'testName' + time,
        };
        it('should addUserSuccess', (done) => {
          console.log(token)
          let ajax = request.post('/user/add')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.email.should.equal(params.email);
            datas.headImage.should.equal(params.headImage);
            datas.realName.should.equal(params.realName);
            datas.userName.should.equal(params.userName);
            datas.status.should.equal(0);
            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let addUserErrer = (callback) => {
    describe('新增用户-少参数userName', ()=> {
      describe('POST /user/add', ()=> {
        let time = new Date().getTime();
        let params = {
          email: time + '@yonyou.com',
          headImage: '',
          realName: 'test' + time,
        };
        it('should addUserError', (done) => {
          let ajax = request.post('/user/add')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('1001');
            expect(body.datas).to.not.exist
            callback();
            done();
          });
        });
      });
    });
  };

  let sendNotice = (results, callback) => {
    let addUserResults = results.addUser;
    let upperParams = addUserResults.params;
    let upperDatas = addUserResults.datas;
    describe('通知用户登录激活', ()=> {
      describe('POST /user/sendnotify', ()=> {
        let params = [{id: upperDatas.id}];
        it('should sendNoticeSuccess', (done) => {
          let ajax = request.post('/user/sendnotify')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('0000');
            let datas = body.datas;

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let sendNotice_empty = (callback) => {
    describe('通知用户登录激活-传空数组', ()=> {
      describe('POST /user/sendnotify', ()=> {
        let params = [];
        it('should sendNoticeSuccess', (done) => {
          let ajax = request.post('/user/sendnotify')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('1001');

            callback(null, {params});
            done();
          });
        });
      });
    });
  };

  let search4add = (results, callback) => {
    let addUserResults = results.addUser;
    let upperParams = addUserResults.params;
    let upperDatas = addUserResults.datas;
    describe('新增用户-查询', ()=> {
      describe('GET /user/query', ()=> {
        let params = {id: upperDatas.id};
        it('should search4addSuccess', (done) => {
          let ajax = request.get('/user/query')
          .set('x-auth-token', token)
          .query(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.id.should.equal(params.id);
            datas.email.should.equal(upperParams.email);
            datas.headImage.should.equal(upperParams.headImage);
            datas.realName.should.equal(upperParams.realName);
            datas.userName.should.equal(upperParams.userName);
            datas.status.should.equal(0);

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let login_notactive = (results, callback) => {
    let addUserResults = results.addUser;
    let upperParams = addUserResults.params;
    let upperDatas = addUserResults.datas;
    loginSuccess({
      username: upperDatas.userName,
      password: config.defaultPassword
    }, (json) => {
      json.body.code.should.equal('4007');
      describe('用户激活并登录', ()=> {
        describe('POST /loginInactive', ()=> {
          let params = {
            username: json.loginParams.username,
            password: json.loginParams.password,
            newPassword: 'qwe123'
          };
          it('should loginInactiveSuccess', (done) => {
            let ajax = request.post('/loginInactive')
            .set('x-auth-token', json.token)
            .send(params)
            .end((err, resp) => {
              resp.should.have.status(200);
              resp.body.should.be.a('object');

              let body = resp.body;
              body.should.have.property('code');
              body.code.should.equal('0000');
              body.should.have.property('datas');
              let datas = body.datas;
              datas.should.have.property('corp');
              datas.should.have.property('user');
              datas.user.status.should.equal(1);

              callback(null, {params, datas});
              done();
            });
          });
        });
      });
    });
  };

  let stopUser = (results, callback) => {
    let login_notactiveResults = results.login_notactive;
    let upperDatas = login_notactiveResults.datas;
    describe('用户停用', ()=> {
      describe('POST /user/enable', ()=> {
        let params = [{
          status: 2,
          id: upperDatas.id
        }];
        it('should stopUserSuccess', (done) => {
          let ajax = request.post('/user/enable')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('0000');

            callback(null, {params});
            done();
          });
        });
      });
    });
  };

  let startUser = (results, callback) => {
    let stopUserResults = results.stopUser;
    let upperParams = stopUserResults.params;
    describe('用户启用', ()=> {
      describe('POST /user/enable', ()=> {
        let params = [{
          status: 1,
          id: upperParams.id
        }];
        it('should startUserSuccess', (done) => {
          let ajax = request.post('/user/enable')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('0000');

            callback(null, {params});
            done();
          });
        });
      });
    });
  };

  let editUser = (results, callback) => {
    let search4addResults = results.search4add;
    let upperParams = search4addResults.params;
    let upperDatas = search4addResults.datas;
    describe('编辑用户', ()=> {
      describe('POST /user/update', ()=> {
        let time = new Date().getTime();
        let params = {
          id: upperDatas.id,
          email: time + '@yonyou.com',
          headImage: 'img' + time,
          realName: 'test' + time,
          userName: 'testName' + time,
          post: 'post' + time,
        };
        it('should editUserSuccess', (done) => {
          let ajax = request.post('/user/update')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.id.should.equal(params.id);
            datas.email.should.equal(params.email);
            datas.headImage.should.equal(params.headImage);
            datas.realName.should.equal(params.realName);
            datas.userName.should.equal(params.userName);
            datas.post.should.equal(params.post);

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let search4edit = (results, callback) => {
    let editUserResults = results.editUser;
    let upperParams = editUserResults.params;
    let upperDatas = editUserResults.datas;
    describe('编辑用户-查询', ()=> {
      describe('GET /user/query', ()=> {
        let params = {id: upperDatas.id};
        it('should search4editSuccess', (done) => {
          let ajax = request.get('/user/query')
          .set('x-auth-token', token)
          .query(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.id.should.equal(params.id);
            datas.email.should.equal(upperParams.email);
            datas.headImage.should.equal(upperParams.headImage);
            datas.realName.should.equal(upperParams.realName);
            datas.userName.should.equal(upperParams.userName);
            datas.post.should.equal(upperParams.post);

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let delUser = (results, callback) => {
    let search4editResults = results.search4edit;
    let upperParams = search4editResults.params;
    let upperDatas = search4editResults.datas;
    describe('删除用户', ()=> {
      describe('POST /user/del', ()=> {
        let params = [{
          id: upperDatas.id
        }];
        it('should delUserSuccess', (done) => {
          let ajax = request.post('/user/del')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('0000');

            let datas = body.datas;

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let search4del = (results, callback) => {
    let delUserResults = results.delUser;
    let upperParams = delUserResults.params;
    let upperDatas = delUserResults.datas;
    describe('删除用户-查询', ()=> {
      describe('GET /user/query', ()=> {
        let params = {id: upperParams[0].id};
        it('should search4delSuccess', (done) => {
          let ajax = request.get('/user/query')
          .set('x-auth-token', token)
          .query(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('0000');
            let datas = body.datas;
            expect(datas).to.not.exist

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let delUser_empty = (results, callback) => {
    let search4delResults = results.search4del;
    let upperParams = search4delResults.params;
    let upperDatas = search4delResults.datas;
    describe('删除用户-用户不存在', ()=> {
      describe('POST /user/del', ()=> {
        let params = [{
          id: upperParams.id
        }];
        it('should delUser_emptyError', (done) => {
          let ajax = request.post('/user/del')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('0000');

            callback();
            done();
          });
        });
      });
    });
  };

  let delUserError = (callback) => {
    describe('删除用户-传空数组', ()=> {
      describe('POST /user/del', ()=> {
        let params = [];
        it('should delUserError', (done) => {
          let ajax = request.post('/user/del')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            body.code.should.equal('1001');

            callback();
            done();
          });
        });
      });
    });
  };

  async.auto({
    addUserErrer,
    delUserError,
    sendNotice_empty,
    addUser,
    search4add: ['addUser', search4add],
    sendNotice: ['search4add', sendNotice],
    login_notactive: ['sendNotice', login_notactive],
    stopUser: ['login_notactive', stopUser],
    startUser: ['stopUser', startUser],
    editUser: ['startUser', editUser],
    search4edit: ['editUser', search4edit],
    delUser: ['search4edit', delUser],
    search4del: ['delUser', search4del],
    delUser_empty: ['search4del', delUser_empty],
  }, (err, results) => {
    exportCallback(err, results);
  });
};