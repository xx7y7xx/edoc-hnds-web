/**
 * Created by zhaolongwei on 17/6/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let async = require('async');
let expect = chai.expect;
let should = chai.should();

chai.use(chaiHttp);

module.exports = function({baseUrl}, exportCallback){
  let request = null;
  beforeEach(() => {
    request = chai.request(baseUrl);
  });

  let auto1 = (callback) => {
    describe('登录接口——正常', ()=> {
      describe('POST /login', ()=> {
        let params = { username: 'admin', password: 'admin' }
        it('should loginSuccess', (done) => {
          let ajax = request.post('/login')
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.should.have.property('corp');
            datas.should.have.property('user');

            callback();
            done();
          });
        });
      });
    });
  };

  let auto2 = (callback) => {
    describe('登录接口——密码错误', ()=> {
      let params = { username: 'admin', password: 'testAdminTest'}
      describe('POST /login', ()=> {
        it('should loginError', (done) => {
          let ajax = request.post('/login')
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            let code = body.code;
            code.should.be.a('string');
            code.should.equal('4001');

            body.should.have.property('msg');

            callback();
            done();
          });
        });
      });
    });
  };

  let auto3 = (callback) => {
    describe('登录接口——缺参username', ()=> {
      let params = {password: 'testAdminTest'}
      describe('POST /login', ()=> {
        it('should loginError', (done) => {
          let ajax = request.post('/login')
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            let code = body.code;
            code.should.equal('8003');

            body.should.have.property('msg');

            callback();
            done();
          });
        });
      });
    });
  };

  let auto4 = (callback) => {
    describe('登录接口——缺参password', ()=> {
      let params = { username: 'admin'}
      describe('POST /login', ()=> {
        it('should loginError', (done) => {
          let ajax = request.post('/login')
          .send(params)
          .end((err, resp) => {
            console.log(resp.body);
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('code');
            let code = body.code;
            code.should.equal('4001');

            body.should.have.property('msg');

            callback();
            done();
          });
        });
      });
    });
  };

  let auto = [auto1, auto2, auto3, auto4];
  async.auto(auto, (err, results) => {
    exportCallback(err, results);
  });
};