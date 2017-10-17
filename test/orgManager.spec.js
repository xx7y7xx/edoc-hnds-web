/**
 * Created by zhaolongwei on 17/6/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let async = require('async');
let expect = chai.expect;
let should = chai.should();

chai.use(chaiHttp);

module.exports = function({userInfo, token, loginParams, baseUrl}, exportCallback){
  let request = null;
  beforeEach(() => {
    request = chai.request(baseUrl);
  });
  describe('组织查询——正常', ()=> {
    describe('GET /org/list', ()=> {
      let params = {keyword:'', page: 1, size: 10 }
      it('should searchSuccess', (done) => {
        let ajax = request.get('/org/list')
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

  describe('组织查询——正常-keyword', ()=> {
    describe('GET /org/list', ()=> {
      let params = {keyword: '单位', page: 1, size: 10 }
      it('should searchSuccess', (done) => {
        let ajax = request.get('/org/list')
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

          done();
        });
      });
    });
  });

  let addOrg = (callback) => {
    describe('新增单位', ()=> {
      describe('POST /org/add', ()=> {
        let time = new Date().getTime();
        let params = {
          orgImage: '',
          orgCode: 'test' + time,
          orgName: 'testName' + time,
        };
        it('should addOrgSuccess', (done) => {
          let ajax = request.post('/org/add')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.orgImage.should.equal(params.orgImage);
            datas.orgCode.should.equal(params.orgCode);
            datas.orgName.should.equal(params.orgName);
            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let addOrgErrer = (callback) => {
    describe('新增单位-少参数orgName', ()=> {
      describe('POST /org/add', ()=> {
        let time = new Date().getTime();
        let params = {
          orgImage: '',
          orgCode: 'test' + time,
        };
        it('should addOrgErrer', (done) => {
          let ajax = request.post('/org/add')
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

  let search4add = (results, callback) => {
    let addOrgResults = results.addOrg;
    let upperParams = addOrgResults.params;
    let upperDatas = addOrgResults.datas;
    describe('新增单位-查询', ()=> {
      describe('GET /org/query', ()=> {
        let params = {id: upperDatas.id};
        it('should search4addSuccess', (done) => {
          let ajax = request.get('/org/query')
          .set('x-auth-token', token)
          .query(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.id.should.equal(params.id);
            datas.orgImage.should.equal(upperParams.orgImage);
            datas.orgCode.should.equal(upperParams.orgCode);
            datas.orgName.should.equal(upperParams.orgName);

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let editOrg = (results, callback) => {
    let search4addResults = results.search4add;
    let upperParams = search4addResults.params;
    let upperDatas = search4addResults.datas;
    describe('编辑单位', ()=> {
      describe('POST /org/update', ()=> {
        let time = new Date().getTime();
        let params = {
          id: upperDatas.id,
          orgCode: 'test' + time,
          orgName: 'testName' + time,
          contacter: 'contacter' + time,
          address: 'address' + time,
        };
        it('should editOrgSuccess', (done) => {
          let ajax = request.post('/org/update')
          .set('x-auth-token', token)
          .send(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.id.should.equal(params.id);
            datas.orgCode.should.equal(params.orgCode);
            datas.orgName.should.equal(params.orgName);
            datas.contacter.should.equal(params.contacter);
            datas.address.should.equal(params.address);

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let search4edit = (results, callback) => {
    let editOrgResults = results.editOrg;
    let upperParams = editOrgResults.params;
    let upperDatas = editOrgResults.datas;
    describe('编辑单位-查询', ()=> {
      describe('GET /org/query', ()=> {
        let params = {id: upperDatas.id};
        it('should search4editSuccess', (done) => {
          let ajax = request.get('/org/query')
          .set('x-auth-token', token)
          .query(params)
          .end((err, resp) => {
            resp.should.have.status(200);
            resp.body.should.be.a('object');

            let body = resp.body;
            body.should.have.property('datas');
            let datas = body.datas;
            datas.id.should.equal(params.id);
            datas.orgCode.should.equal(upperParams.orgCode);
            datas.orgName.should.equal(upperParams.orgName);
            datas.contacter.should.equal(upperParams.contacter);
            datas.address.should.equal(upperParams.address);

            callback(null, {params, datas});
            done();
          });
        });
      });
    });
  };

  let delOrg = (results, callback) => {
    let search4addResults = results.search4add;
    let upperParams = search4addResults.params;
    let upperDatas = search4addResults.datas;
    describe('删除单位', ()=> {
      describe('POST /org/del', ()=> {
        let time = new Date().getTime();
        let params = [{
          id: upperDatas.id
        }];
        it('should delOrgSuccess', (done) => {
          let ajax = request.post('/org/del')
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
    let delOrgResults = results.delOrg;
    let upperParams = delOrgResults.params;
    let upperDatas = delOrgResults.datas;
    describe('删除单位-查询', ()=> {
      describe('GET /org/query', ()=> {
        let params = {id: upperParams[0].id};
        it('should search4delSuccess', (done) => {
          let ajax = request.get('/org/query')
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

  let delOrg_notexit = (results, callback) => {
    let search4delResults = results.search4del;
    let upperParams = search4delResults.params;
    let upperDatas = search4delResults.datas;
    describe('删除单位-单位不存在', ()=> {
      describe('POST /org/del', ()=> {
        let time = new Date().getTime();
        let params = [{
          id: upperParams.id
        }];
        it('should delOrg_notexitError', (done) => {
          let ajax = request.post('/org/del')
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

  let delOrgError = (callback) => {
    describe('删除单位-传空数组', ()=> {
      describe('POST /org/del', ()=> {
        let time = new Date().getTime();
        let params = [];
        it('should delOrgError', (done) => {
          let ajax = request.post('/org/del')
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
    addOrg,
    addOrgErrer,
    delOrgError,
    delOrg: ['search4edit', delOrg],
    editOrg: ['search4add', editOrg],
    search4add: ['addOrg', search4add],
    search4edit: ['editOrg', search4edit],
    search4del: ['delOrg', search4del],
    delOrg_notexit: ['search4del', delOrg_notexit]
  }, (err, results) => {
    exportCallback(err, results);
  });
};