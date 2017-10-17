/**
 * Created by zhaolongwei on 17/5/4.
 */
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
let should = chai.should();
let login = require('./login');
let { testContextUrl } = require('./config');
let loginSuccess = login.loginSuccess;

chai.use(chaiHttp);

//login.loginTest();

loginSuccess(({userInfo, token}) => {
    describe('角色管理', ()=> {
        var request = null;
        var user = userInfo.user;
        var corp = userInfo.corp;
        beforeEach(() => {
            request = chai.request(testContextUrl);
        });
        describe('POST /role/list', ()=> {
            it('should get a list', (done) => {
                console.log(token)
                request.post('/role/list?page=1&size=10')
                    .set('x-auth-token', token)
                    .send({
                        keyword: 'a'
                    })
                    .end((err, resp) => {
                        resp.should.have.status(200);
                        var body = resp.body;
                        console.log(body)
                        body.should.have.property('datas');
                        var pageList = body.datas.pageList;
                        pageList.should.be.a('array');
                        done();
                    })
            })
        })

        var newRoleId = '';
        describe('POST /role/add', ()=> {
            it('should get a list', (done) => {
                console.log(token)
                request.post('/role/add')
                    .set('x-auth-token', token)
                    .send({
                        corpId: corp.id,
                        roleCode: 'test_code01',
                        roleName: 'test_name01',
                        desc: 'test_desc01',
                        isEnable: 'Y'
                    })
                    .end((err, resp) => {
                        resp.should.have.status(200);
                        var body = resp.body;
                        console.log(body)
                        body.should.have.property('datas');
                        var datas = body.datas;
                        datas.should.be.a('object');
                        console.log(datas);
                        datas.roleCode.should.be.a('string');
                        datas.roleCode.should.equal('test_code01');
                        newRoleId = datas.id
                        done();
                    })
            })
        })

        describe('POST /role/update', ()=> {
            it('should get a list', (done) => {
                console.log(token)
                request.post('/role/add')
                    .set('x-auth-token', token)
                    .send({
                        id: newRoleId,
                        roleCode: 'test_code02',
                        roleName: 'test_name02',
                        desc: 'test_desc02',
                        isEnable: 'Y'
                    })
                    .end((err, resp) => {
                        resp.should.have.status(200);
                        let body = resp.body;
                        console.log(body)
                        body.should.have.property('datas');
                        let datas = body.datas;
                        datas.should.be.a('object');
                        console.log(datas);
                        datas.roleCode.should.be.a('string');
                        datas.roleCode.should.equal('test_code02');
                        datas.roleName.should.equal('test_name02');
                        datas.desc.should.equal('test_desc02');
                        done();
                    })
            })
        })

        describe('POST /role/edit', ()=> {
            it('should get a list', (done) => {
                console.log(token)
                request.post('/role/add')
                    .set('x-auth-token', token)
                    .send({
                        id: newRoleId,
                        roleCode: 'test_code02',
                        roleName: 'test_name02',
                        desc: 'test_desc02',
                        isEnable: 'Y'
                    })
                    .end((err, resp) => {
                        resp.should.have.status(200);
                        let body = resp.body;
                        console.log(body)
                        body.should.have.property('datas');
                        let datas = body.datas;
                        datas.should.be.a('object');
                        console.log(datas);
                        datas.roleCode.should.be.a('string');
                        datas.roleCode.should.equal('test_code02');
                        datas.roleName.should.equal('test_name02');
                        datas.desc.should.equal('test_desc02');
                        done();
                    })
            })
        })
    });
})