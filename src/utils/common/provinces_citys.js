/**
 * Created by APP on 2017/6/20.
 */
let provincesOptions = [{
  "ProID": 1,
  "label": "北京",
  "ProSort": 1,
  "ProRemark": "直辖市",
  "children": [{"CityID": 1, "label": "北京市", "ProID": 1, "CitySort": 1, "value": "北京市"}],
  "value": "北京"
}, {
  "ProID": 2,
  "label": "天津",
  "ProSort": 2,
  "ProRemark": "直辖市",
  "children": [{"CityID": 2, "label": "天津市", "ProID": 2, "CitySort": 2, "value": "天津市"}],
  "value": "天津"
}, {
  "ProID": 3,
  "label": "河北省",
  "ProSort": 5,
  "ProRemark": "省份",
  "children": [{"CityID": 5, "label": "邯郸市", "ProID": 3, "CitySort": 5, "value": "邯郸市"}, {
    "CityID": 6,
    "label": "石家庄市",
    "ProID": 3,
    "CitySort": 6,
    "value": "石家庄市"
  }, {"CityID": 7, "label": "保定市", "ProID": 3, "CitySort": 7, "value": "保定市"}, {
    "CityID": 8,
    "label": "张家口市",
    "ProID": 3,
    "CitySort": 8,
    "value": "张家口市"
  }, {"CityID": 9, "label": "承德市", "ProID": 3, "CitySort": 9, "value": "承德市"}, {
    "CityID": 10,
    "label": "唐山市",
    "ProID": 3,
    "CitySort": 10,
    "value": "唐山市"
  }, {"CityID": 11, "label": "廊坊市", "ProID": 3, "CitySort": 11, "value": "廊坊市"}, {
    "CityID": 12,
    "label": "沧州市",
    "ProID": 3,
    "CitySort": 12,
    "value": "沧州市"
  }, {"CityID": 13, "label": "衡水市", "ProID": 3, "CitySort": 13, "value": "衡水市"}, {
    "CityID": 14,
    "label": "邢台市",
    "ProID": 3,
    "CitySort": 14,
    "value": "邢台市"
  }],
  "value": "河北省"
}, {
  "ProID": 4,
  "label": "山西省",
  "ProSort": 6,
  "ProRemark": "省份",
  "children": [{"CityID": 16, "label": "朔州市", "ProID": 4, "CitySort": 16, "value": "朔州市"}, {
    "CityID": 17,
    "label": "忻州市",
    "ProID": 4,
    "CitySort": 17,
    "value": "忻州市"
  }, {"CityID": 18, "label": "太原市", "ProID": 4, "CitySort": 18, "value": "太原市"}, {
    "CityID": 19,
    "label": "大同市",
    "ProID": 4,
    "CitySort": 19,
    "value": "大同市"
  }, {"CityID": 20, "label": "阳泉市", "ProID": 4, "CitySort": 20, "value": "阳泉市"}, {
    "CityID": 21,
    "label": "晋中市",
    "ProID": 4,
    "CitySort": 21,
    "value": "晋中市"
  }, {"CityID": 22, "label": "长治市", "ProID": 4, "CitySort": 22, "value": "长治市"}, {
    "CityID": 23,
    "label": "晋城市",
    "ProID": 4,
    "CitySort": 23,
    "value": "晋城市"
  }, {"CityID": 24, "label": "临汾市", "ProID": 4, "CitySort": 24, "value": "临汾市"}, {
    "CityID": 25,
    "label": "吕梁市",
    "ProID": 4,
    "CitySort": 25,
    "value": "吕梁市"
  }, {"CityID": 26, "label": "运城市", "ProID": 4, "CitySort": 26, "value": "运城市"}],
  "value": "山西省"
}, {
  "ProID": 5,
  "label": "内蒙古自治区",
  "ProSort": 32,
  "ProRemark": "自治区",
  "children": [{"CityID": 351, "label": "呼伦贝尔市", "ProID": 5, "CitySort": 351, "value": "呼伦贝尔市"}, {
    "CityID": 352,
    "label": "呼和浩特市",
    "ProID": 5,
    "CitySort": 352,
    "value": "呼和浩特市"
  }, {"CityID": 353, "label": "包头市", "ProID": 5, "CitySort": 353, "value": "包头市"}, {
    "CityID": 354,
    "label": "乌海市",
    "ProID": 5,
    "CitySort": 354,
    "value": "乌海市"
  }, {"CityID": 355, "label": "乌兰察布市", "ProID": 5, "CitySort": 355, "value": "乌兰察布市"}, {
    "CityID": 356,
    "label": "通辽市",
    "ProID": 5,
    "CitySort": 356,
    "value": "通辽市"
  }, {"CityID": 357, "label": "赤峰市", "ProID": 5, "CitySort": 357, "value": "赤峰市"}, {
    "CityID": 358,
    "label": "鄂尔多斯市",
    "ProID": 5,
    "CitySort": 358,
    "value": "鄂尔多斯市"
  }, {"CityID": 359, "label": "巴彦淖尔市", "ProID": 5, "CitySort": 359, "value": "巴彦淖尔市"}, {
    "CityID": 360,
    "label": "锡林郭勒盟",
    "ProID": 5,
    "CitySort": 360,
    "value": "锡林郭勒盟"
  }, {"CityID": 361, "label": "兴安盟", "ProID": 5, "CitySort": 361, "value": "兴安盟"}, {
    "CityID": 362,
    "label": "阿拉善盟",
    "ProID": 5,
    "CitySort": 362,
    "value": "阿拉善盟"
  }],
  "value": "内蒙古自治区"
}, {
  "ProID": 6,
  "label": "辽宁省",
  "ProSort": 8,
  "ProRemark": "省份",
  "children": [{"CityID": 27, "label": "沈阳市", "ProID": 6, "CitySort": 27, "value": "沈阳市"}, {
    "CityID": 28,
    "label": "铁岭市",
    "ProID": 6,
    "CitySort": 28,
    "value": "铁岭市"
  }, {"CityID": 29, "label": "大连市", "ProID": 6, "CitySort": 29, "value": "大连市"}, {
    "CityID": 30,
    "label": "鞍山市",
    "ProID": 6,
    "CitySort": 30,
    "value": "鞍山市"
  }, {"CityID": 31, "label": "抚顺市", "ProID": 6, "CitySort": 31, "value": "抚顺市"}, {
    "CityID": 32,
    "label": "本溪市",
    "ProID": 6,
    "CitySort": 32,
    "value": "本溪市"
  }, {"CityID": 33, "label": "丹东市", "ProID": 6, "CitySort": 33, "value": "丹东市"}, {
    "CityID": 34,
    "label": "锦州市",
    "ProID": 6,
    "CitySort": 34,
    "value": "锦州市"
  }, {"CityID": 35, "label": "营口市", "ProID": 6, "CitySort": 35, "value": "营口市"}, {
    "CityID": 36,
    "label": "阜新市",
    "ProID": 6,
    "CitySort": 36,
    "value": "阜新市"
  }, {"CityID": 37, "label": "辽阳市", "ProID": 6, "CitySort": 37, "value": "辽阳市"}, {
    "CityID": 38,
    "label": "朝阳市",
    "ProID": 6,
    "CitySort": 38,
    "value": "朝阳市"
  }, {"CityID": 39, "label": "盘锦市", "ProID": 6, "CitySort": 39, "value": "盘锦市"}, {
    "CityID": 40,
    "label": "葫芦岛市",
    "ProID": 6,
    "CitySort": 40,
    "value": "葫芦岛市"
  }],
  "value": "辽宁省"
}, {
  "ProID": 7,
  "label": "吉林省",
  "ProSort": 9,
  "ProRemark": "省份",
  "children": [{"CityID": 41, "label": "长春市", "ProID": 7, "CitySort": 41, "value": "长春市"}, {
    "CityID": 42,
    "label": "吉林市",
    "ProID": 7,
    "CitySort": 42,
    "value": "吉林市"
  }, {"CityID": 43, "label": "延边朝鲜族自治州", "ProID": 7, "CitySort": 43, "value": "延边朝鲜族自治州"}, {
    "CityID": 44,
    "label": "四平市",
    "ProID": 7,
    "CitySort": 44,
    "value": "四平市"
  }, {"CityID": 45, "label": "通化市", "ProID": 7, "CitySort": 45, "value": "通化市"}, {
    "CityID": 46,
    "label": "白城市",
    "ProID": 7,
    "CitySort": 46,
    "value": "白城市"
  }, {"CityID": 47, "label": "辽源市", "ProID": 7, "CitySort": 47, "value": "辽源市"}, {
    "CityID": 48,
    "label": "松原市",
    "ProID": 7,
    "CitySort": 48,
    "value": "松原市"
  }, {"CityID": 49, "label": "白山市", "ProID": 7, "CitySort": 49, "value": "白山市"}],
  "value": "吉林省"
}, {
  "ProID": 8,
  "label": "黑龙江省",
  "ProSort": 10,
  "ProRemark": "省份",
  "children": [{"CityID": 50, "label": "哈尔滨市", "ProID": 8, "CitySort": 50, "value": "哈尔滨市"}, {
    "CityID": 51,
    "label": "齐齐哈尔市",
    "ProID": 8,
    "CitySort": 51,
    "value": "齐齐哈尔市"
  }, {"CityID": 52, "label": "鸡西市", "ProID": 8, "CitySort": 52, "value": "鸡西市"}, {
    "CityID": 53,
    "label": "牡丹江市",
    "ProID": 8,
    "CitySort": 53,
    "value": "牡丹江市"
  }, {"CityID": 54, "label": "七台河市", "ProID": 8, "CitySort": 54, "value": "七台河市"}, {
    "CityID": 55,
    "label": "佳木斯市",
    "ProID": 8,
    "CitySort": 55,
    "value": "佳木斯市"
  }, {"CityID": 56, "label": "鹤岗市", "ProID": 8, "CitySort": 56, "value": "鹤岗市"}, {
    "CityID": 57,
    "label": "双鸭山市",
    "ProID": 8,
    "CitySort": 57,
    "value": "双鸭山市"
  }, {"CityID": 58, "label": "绥化市", "ProID": 8, "CitySort": 58, "value": "绥化市"}, {
    "CityID": 59,
    "label": "黑河市",
    "ProID": 8,
    "CitySort": 59,
    "value": "黑河市"
  }, {"CityID": 60, "label": "大兴安岭地区", "ProID": 8, "CitySort": 60, "value": "大兴安岭地区"}, {
    "CityID": 61,
    "label": "伊春市",
    "ProID": 8,
    "CitySort": 61,
    "value": "伊春市"
  }, {"CityID": 62, "label": "大庆市", "ProID": 8, "CitySort": 62, "value": "大庆市"}],
  "value": "黑龙江省"
}, {
  "ProID": 9,
  "label": "上海",
  "ProSort": 3,
  "ProRemark": "直辖市",
  "children": [{"CityID": 3, "label": "上海市", "ProID": 9, "CitySort": 3, "value": "上海市"}],
  "value": "上海"
}, {
  "ProID": 10,
  "label": "江苏省",
  "ProSort": 11,
  "ProRemark": "省份",
  "children": [{"CityID": 63, "label": "南京市", "ProID": 10, "CitySort": 63, "value": "南京市"}, {
    "CityID": 64,
    "label": "无锡市",
    "ProID": 10,
    "CitySort": 64,
    "value": "无锡市"
  }, {"CityID": 65, "label": "镇江市", "ProID": 10, "CitySort": 65, "value": "镇江市"}, {
    "CityID": 66,
    "label": "苏州市",
    "ProID": 10,
    "CitySort": 66,
    "value": "苏州市"
  }, {"CityID": 67, "label": "南通市", "ProID": 10, "CitySort": 67, "value": "南通市"}, {
    "CityID": 68,
    "label": "扬州市",
    "ProID": 10,
    "CitySort": 68,
    "value": "扬州市"
  }, {"CityID": 69, "label": "盐城市", "ProID": 10, "CitySort": 69, "value": "盐城市"}, {
    "CityID": 70,
    "label": "徐州市",
    "ProID": 10,
    "CitySort": 70,
    "value": "徐州市"
  }, {"CityID": 71, "label": "淮安市", "ProID": 10, "CitySort": 71, "value": "淮安市"}, {
    "CityID": 72,
    "label": "连云港市",
    "ProID": 10,
    "CitySort": 72,
    "value": "连云港市"
  }, {"CityID": 73, "label": "常州市", "ProID": 10, "CitySort": 73, "value": "常州市"}, {
    "CityID": 74,
    "label": "泰州市",
    "ProID": 10,
    "CitySort": 74,
    "value": "泰州市"
  }, {"CityID": 75, "label": "宿迁市", "ProID": 10, "CitySort": 75, "value": "宿迁市"}],
  "value": "江苏省"
}, {
  "ProID": 11,
  "label": "浙江省",
  "ProSort": 12,
  "ProRemark": "省份",
  "children": [{"CityID": 76, "label": "舟山市", "ProID": 11, "CitySort": 76, "value": "舟山市"}, {
    "CityID": 77,
    "label": "衢州市",
    "ProID": 11,
    "CitySort": 77,
    "value": "衢州市"
  }, {"CityID": 78, "label": "杭州市", "ProID": 11, "CitySort": 78, "value": "杭州市"}, {
    "CityID": 79,
    "label": "湖州市",
    "ProID": 11,
    "CitySort": 79,
    "value": "湖州市"
  }, {"CityID": 80, "label": "嘉兴市", "ProID": 11, "CitySort": 80, "value": "嘉兴市"}, {
    "CityID": 81,
    "label": "宁波市",
    "ProID": 11,
    "CitySort": 81,
    "value": "宁波市"
  }, {"CityID": 82, "label": "绍兴市", "ProID": 11, "CitySort": 82, "value": "绍兴市"}, {
    "CityID": 83,
    "label": "温州市",
    "ProID": 11,
    "CitySort": 83,
    "value": "温州市"
  }, {"CityID": 84, "label": "丽水市", "ProID": 11, "CitySort": 84, "value": "丽水市"}, {
    "CityID": 85,
    "label": "金华市",
    "ProID": 11,
    "CitySort": 85,
    "value": "金华市"
  }, {"CityID": 86, "label": "台州市", "ProID": 11, "CitySort": 86, "value": "台州市"}],
  "value": "浙江省"
}, {
  "ProID": 12,
  "label": "安徽省",
  "ProSort": 13,
  "ProRemark": "省份",
  "children": [{"CityID": 87, "label": "合肥市", "ProID": 12, "CitySort": 87, "value": "合肥市"}, {
    "CityID": 88,
    "label": "芜湖市",
    "ProID": 12,
    "CitySort": 88,
    "value": "芜湖市"
  }, {"CityID": 89, "label": "蚌埠市", "ProID": 12, "CitySort": 89, "value": "蚌埠市"}, {
    "CityID": 90,
    "label": "淮南市",
    "ProID": 12,
    "CitySort": 90,
    "value": "淮南市"
  }, {"CityID": 91, "label": "马鞍山市", "ProID": 12, "CitySort": 91, "value": "马鞍山市"}, {
    "CityID": 92,
    "label": "淮北市",
    "ProID": 12,
    "CitySort": 92,
    "value": "淮北市"
  }, {"CityID": 93, "label": "铜陵市", "ProID": 12, "CitySort": 93, "value": "铜陵市"}, {
    "CityID": 94,
    "label": "安庆市",
    "ProID": 12,
    "CitySort": 94,
    "value": "安庆市"
  }, {"CityID": 95, "label": "黄山市", "ProID": 12, "CitySort": 95, "value": "黄山市"}, {
    "CityID": 96,
    "label": "滁州市",
    "ProID": 12,
    "CitySort": 96,
    "value": "滁州市"
  }, {"CityID": 97, "label": "阜阳市", "ProID": 12, "CitySort": 97, "value": "阜阳市"}, {
    "CityID": 98,
    "label": "宿州市",
    "ProID": 12,
    "CitySort": 98,
    "value": "宿州市"
  }, {"CityID": 99, "label": "巢湖市", "ProID": 12, "CitySort": 99, "value": "巢湖市"}, {
    "CityID": 100,
    "label": "六安市",
    "ProID": 12,
    "CitySort": 100,
    "value": "六安市"
  }, {"CityID": 101, "label": "亳州市", "ProID": 12, "CitySort": 101, "value": "亳州市"}, {
    "CityID": 102,
    "label": "池州市",
    "ProID": 12,
    "CitySort": 102,
    "value": "池州市"
  }, {"CityID": 103, "label": "宣城市", "ProID": 12, "CitySort": 103, "value": "宣城市"}],
  "value": "安徽省"
}, {
  "ProID": 13,
  "label": "福建省",
  "ProSort": 14,
  "ProRemark": "省份",
  "children": [{"CityID": 104, "label": "福州市", "ProID": 13, "CitySort": 104, "value": "福州市"}, {
    "CityID": 105,
    "label": "厦门市",
    "ProID": 13,
    "CitySort": 105,
    "value": "厦门市"
  }, {"CityID": 106, "label": "宁德市", "ProID": 13, "CitySort": 106, "value": "宁德市"}, {
    "CityID": 107,
    "label": "莆田市",
    "ProID": 13,
    "CitySort": 107,
    "value": "莆田市"
  }, {"CityID": 108, "label": "泉州市", "ProID": 13, "CitySort": 108, "value": "泉州市"}, {
    "CityID": 109,
    "label": "漳州市",
    "ProID": 13,
    "CitySort": 109,
    "value": "漳州市"
  }, {"CityID": 110, "label": "龙岩市", "ProID": 13, "CitySort": 110, "value": "龙岩市"}, {
    "CityID": 111,
    "label": "三明市",
    "ProID": 13,
    "CitySort": 111,
    "value": "三明市"
  }, {"CityID": 112, "label": "南平市", "ProID": 13, "CitySort": 112, "value": "南平市"}],
  "value": "福建省"
}, {
  "ProID": 14,
  "label": "江西省",
  "ProSort": 15,
  "ProRemark": "省份",
  "children": [{"CityID": 113, "label": "鹰潭市", "ProID": 14, "CitySort": 113, "value": "鹰潭市"}, {
    "CityID": 114,
    "label": "新余市",
    "ProID": 14,
    "CitySort": 114,
    "value": "新余市"
  }, {"CityID": 115, "label": "南昌市", "ProID": 14, "CitySort": 115, "value": "南昌市"}, {
    "CityID": 116,
    "label": "九江市",
    "ProID": 14,
    "CitySort": 116,
    "value": "九江市"
  }, {"CityID": 117, "label": "上饶市", "ProID": 14, "CitySort": 117, "value": "上饶市"}, {
    "CityID": 118,
    "label": "抚州市",
    "ProID": 14,
    "CitySort": 118,
    "value": "抚州市"
  }, {"CityID": 119, "label": "宜春市", "ProID": 14, "CitySort": 119, "value": "宜春市"}, {
    "CityID": 120,
    "label": "吉安市",
    "ProID": 14,
    "CitySort": 120,
    "value": "吉安市"
  }, {"CityID": 121, "label": "赣州市", "ProID": 14, "CitySort": 121, "value": "赣州市"}, {
    "CityID": 122,
    "label": "景德镇市",
    "ProID": 14,
    "CitySort": 122,
    "value": "景德镇市"
  }, {"CityID": 123, "label": "萍乡市", "ProID": 14, "CitySort": 123, "value": "萍乡市"}],
  "value": "江西省"
}, {
  "ProID": 15,
  "label": "山东省",
  "ProSort": 16,
  "ProRemark": "省份",
  "children": [{"CityID": 124, "label": "菏泽市", "ProID": 15, "CitySort": 124, "value": "菏泽市"}, {
    "CityID": 125,
    "label": "济南市",
    "ProID": 15,
    "CitySort": 125,
    "value": "济南市"
  }, {"CityID": 126, "label": "青岛市", "ProID": 15, "CitySort": 126, "value": "青岛市"}, {
    "CityID": 127,
    "label": "淄博市",
    "ProID": 15,
    "CitySort": 127,
    "value": "淄博市"
  }, {"CityID": 128, "label": "德州市", "ProID": 15, "CitySort": 128, "value": "德州市"}, {
    "CityID": 129,
    "label": "烟台市",
    "ProID": 15,
    "CitySort": 129,
    "value": "烟台市"
  }, {"CityID": 130, "label": "潍坊市", "ProID": 15, "CitySort": 130, "value": "潍坊市"}, {
    "CityID": 131,
    "label": "济宁市",
    "ProID": 15,
    "CitySort": 131,
    "value": "济宁市"
  }, {"CityID": 132, "label": "泰安市", "ProID": 15, "CitySort": 132, "value": "泰安市"}, {
    "CityID": 133,
    "label": "临沂市",
    "ProID": 15,
    "CitySort": 133,
    "value": "临沂市"
  }, {"CityID": 134, "label": "滨州市", "ProID": 15, "CitySort": 134, "value": "滨州市"}, {
    "CityID": 135,
    "label": "东营市",
    "ProID": 15,
    "CitySort": 135,
    "value": "东营市"
  }, {"CityID": 136, "label": "威海市", "ProID": 15, "CitySort": 136, "value": "威海市"}, {
    "CityID": 137,
    "label": "枣庄市",
    "ProID": 15,
    "CitySort": 137,
    "value": "枣庄市"
  }, {"CityID": 138, "label": "日照市", "ProID": 15, "CitySort": 138, "value": "日照市"}, {
    "CityID": 139,
    "label": "莱芜市",
    "ProID": 15,
    "CitySort": 139,
    "value": "莱芜市"
  }, {"CityID": 140, "label": "聊城市", "ProID": 15, "CitySort": 140, "value": "聊城市"}],
  "value": "山东省"
}, {
  "ProID": 16,
  "label": "河南省",
  "ProSort": 17,
  "ProRemark": "省份",
  "children": [{"CityID": 141, "label": "商丘市", "ProID": 16, "CitySort": 141, "value": "商丘市"}, {
    "CityID": 142,
    "label": "郑州市",
    "ProID": 16,
    "CitySort": 142,
    "value": "郑州市"
  }, {"CityID": 143, "label": "安阳市", "ProID": 16, "CitySort": 143, "value": "安阳市"}, {
    "CityID": 144,
    "label": "新乡市",
    "ProID": 16,
    "CitySort": 144,
    "value": "新乡市"
  }, {"CityID": 145, "label": "许昌市", "ProID": 16, "CitySort": 145, "value": "许昌市"}, {
    "CityID": 146,
    "label": "平顶山市",
    "ProID": 16,
    "CitySort": 146,
    "value": "平顶山市"
  }, {"CityID": 147, "label": "信阳市", "ProID": 16, "CitySort": 147, "value": "信阳市"}, {
    "CityID": 148,
    "label": "南阳市",
    "ProID": 16,
    "CitySort": 148,
    "value": "南阳市"
  }, {"CityID": 149, "label": "开封市", "ProID": 16, "CitySort": 149, "value": "开封市"}, {
    "CityID": 150,
    "label": "洛阳市",
    "ProID": 16,
    "CitySort": 150,
    "value": "洛阳市"
  }, {"CityID": 151, "label": "济源市", "ProID": 16, "CitySort": 151, "value": "济源市"}, {
    "CityID": 152,
    "label": "焦作市",
    "ProID": 16,
    "CitySort": 152,
    "value": "焦作市"
  }, {"CityID": 153, "label": "鹤壁市", "ProID": 16, "CitySort": 153, "value": "鹤壁市"}, {
    "CityID": 154,
    "label": "濮阳市",
    "ProID": 16,
    "CitySort": 154,
    "value": "濮阳市"
  }, {"CityID": 155, "label": "周口市", "ProID": 16, "CitySort": 155, "value": "周口市"}, {
    "CityID": 156,
    "label": "漯河市",
    "ProID": 16,
    "CitySort": 156,
    "value": "漯河市"
  }, {"CityID": 157, "label": "驻马店市", "ProID": 16, "CitySort": 157, "value": "驻马店市"}, {
    "CityID": 158,
    "label": "三门峡市",
    "ProID": 16,
    "CitySort": 158,
    "value": "三门峡市"
  }],
  "value": "河南省"
}, {
  "ProID": 17,
  "label": "湖北省",
  "ProSort": 18,
  "ProRemark": "省份",
  "children": [{"CityID": 159, "label": "武汉市", "ProID": 17, "CitySort": 159, "value": "武汉市"}, {
    "CityID": 160,
    "label": "襄樊市",
    "ProID": 17,
    "CitySort": 160,
    "value": "襄樊市"
  }, {"CityID": 161, "label": "鄂州市", "ProID": 17, "CitySort": 161, "value": "鄂州市"}, {
    "CityID": 162,
    "label": "孝感市",
    "ProID": 17,
    "CitySort": 162,
    "value": "孝感市"
  }, {"CityID": 163, "label": "黄冈市", "ProID": 17, "CitySort": 163, "value": "黄冈市"}, {
    "CityID": 164,
    "label": "黄石市",
    "ProID": 17,
    "CitySort": 164,
    "value": "黄石市"
  }, {"CityID": 165, "label": "咸宁市", "ProID": 17, "CitySort": 165, "value": "咸宁市"}, {
    "CityID": 166,
    "label": "荆州市",
    "ProID": 17,
    "CitySort": 166,
    "value": "荆州市"
  }, {"CityID": 167, "label": "宜昌市", "ProID": 17, "CitySort": 167, "value": "宜昌市"}, {
    "CityID": 168,
    "label": "恩施土家族苗族自治州",
    "ProID": 17,
    "CitySort": 168,
    "value": "恩施土家族苗族自治州"
  }, {"CityID": 169, "label": "神农架林区", "ProID": 17, "CitySort": 169, "value": "神农架林区"}, {
    "CityID": 170,
    "label": "十堰市",
    "ProID": 17,
    "CitySort": 170,
    "value": "十堰市"
  }, {"CityID": 171, "label": "随州市", "ProID": 17, "CitySort": 171, "value": "随州市"}, {
    "CityID": 172,
    "label": "荆门市",
    "ProID": 17,
    "CitySort": 172,
    "value": "荆门市"
  }, {"CityID": 173, "label": "仙桃市", "ProID": 17, "CitySort": 173, "value": "仙桃市"}, {
    "CityID": 174,
    "label": "天门市",
    "ProID": 17,
    "CitySort": 174,
    "value": "天门市"
  }, {"CityID": 175, "label": "潜江市", "ProID": 17, "CitySort": 175, "value": "潜江市"}],
  "value": "湖北省"
}, {
  "ProID": 18,
  "label": "湖南省",
  "ProSort": 19,
  "ProRemark": "省份",
  "children": [{"CityID": 176, "label": "岳阳市", "ProID": 18, "CitySort": 176, "value": "岳阳市"}, {
    "CityID": 177,
    "label": "长沙市",
    "ProID": 18,
    "CitySort": 177,
    "value": "长沙市"
  }, {"CityID": 178, "label": "湘潭市", "ProID": 18, "CitySort": 178, "value": "湘潭市"}, {
    "CityID": 179,
    "label": "株洲市",
    "ProID": 18,
    "CitySort": 179,
    "value": "株洲市"
  }, {"CityID": 180, "label": "衡阳市", "ProID": 18, "CitySort": 180, "value": "衡阳市"}, {
    "CityID": 181,
    "label": "郴州市",
    "ProID": 18,
    "CitySort": 181,
    "value": "郴州市"
  }, {"CityID": 182, "label": "常德市", "ProID": 18, "CitySort": 182, "value": "常德市"}, {
    "CityID": 183,
    "label": "益阳市",
    "ProID": 18,
    "CitySort": 183,
    "value": "益阳市"
  }, {"CityID": 184, "label": "娄底市", "ProID": 18, "CitySort": 184, "value": "娄底市"}, {
    "CityID": 185,
    "label": "邵阳市",
    "ProID": 18,
    "CitySort": 185,
    "value": "邵阳市"
  }, {"CityID": 186, "label": "湘西土家族苗族自治州", "ProID": 18, "CitySort": 186, "value": "湘西土家族苗族自治州"}, {
    "CityID": 187,
    "label": "张家界市",
    "ProID": 18,
    "CitySort": 187,
    "value": "张家界市"
  }, {"CityID": 188, "label": "怀化市", "ProID": 18, "CitySort": 188, "value": "怀化市"}, {
    "CityID": 189,
    "label": "永州市",
    "ProID": 18,
    "CitySort": 189,
    "value": "永州市"
  }],
  "value": "湖南省"
}, {
  "ProID": 19,
  "label": "广东省",
  "ProSort": 20,
  "ProRemark": "省份",
  "children": [{"CityID": 190, "label": "广州市", "ProID": 19, "CitySort": 190, "value": "广州市"}, {
    "CityID": 191,
    "label": "汕尾市",
    "ProID": 19,
    "CitySort": 191,
    "value": "汕尾市"
  }, {"CityID": 192, "label": "阳江市", "ProID": 19, "CitySort": 192, "value": "阳江市"}, {
    "CityID": 193,
    "label": "揭阳市",
    "ProID": 19,
    "CitySort": 193,
    "value": "揭阳市"
  }, {"CityID": 194, "label": "茂名市", "ProID": 19, "CitySort": 194, "value": "茂名市"}, {
    "CityID": 195,
    "label": "惠州市",
    "ProID": 19,
    "CitySort": 195,
    "value": "惠州市"
  }, {"CityID": 196, "label": "江门市", "ProID": 19, "CitySort": 196, "value": "江门市"}, {
    "CityID": 197,
    "label": "韶关市",
    "ProID": 19,
    "CitySort": 197,
    "value": "韶关市"
  }, {"CityID": 198, "label": "梅州市", "ProID": 19, "CitySort": 198, "value": "梅州市"}, {
    "CityID": 199,
    "label": "汕头市",
    "ProID": 19,
    "CitySort": 199,
    "value": "汕头市"
  }, {"CityID": 200, "label": "深圳市", "ProID": 19, "CitySort": 200, "value": "深圳市"}, {
    "CityID": 201,
    "label": "珠海市",
    "ProID": 19,
    "CitySort": 201,
    "value": "珠海市"
  }, {"CityID": 202, "label": "佛山市", "ProID": 19, "CitySort": 202, "value": "佛山市"}, {
    "CityID": 203,
    "label": "肇庆市",
    "ProID": 19,
    "CitySort": 203,
    "value": "肇庆市"
  }, {"CityID": 204, "label": "湛江市", "ProID": 19, "CitySort": 204, "value": "湛江市"}, {
    "CityID": 205,
    "label": "中山市",
    "ProID": 19,
    "CitySort": 205,
    "value": "中山市"
  }, {"CityID": 206, "label": "河源市", "ProID": 19, "CitySort": 206, "value": "河源市"}, {
    "CityID": 207,
    "label": "清远市",
    "ProID": 19,
    "CitySort": 207,
    "value": "清远市"
  }, {"CityID": 208, "label": "云浮市", "ProID": 19, "CitySort": 208, "value": "云浮市"}, {
    "CityID": 209,
    "label": "潮州市",
    "ProID": 19,
    "CitySort": 209,
    "value": "潮州市"
  }, {"CityID": 210, "label": "东莞市", "ProID": 19, "CitySort": 210, "value": "东莞市"}],
  "value": "广东省"
}, {
  "ProID": 20,
  "label": "海南省",
  "ProSort": 24,
  "ProRemark": "省份",
  "children": [{"CityID": 255, "label": "海口市", "ProID": 20, "CitySort": 255, "value": "海口市"}, {
    "CityID": 256,
    "label": "三亚市",
    "ProID": 20,
    "CitySort": 256,
    "value": "三亚市"
  }, {"CityID": 257, "label": "五指山市", "ProID": 20, "CitySort": 257, "value": "五指山市"}, {
    "CityID": 258,
    "label": "琼海市",
    "ProID": 20,
    "CitySort": 258,
    "value": "琼海市"
  }, {"CityID": 259, "label": "儋州市", "ProID": 20, "CitySort": 259, "value": "儋州市"}, {
    "CityID": 260,
    "label": "文昌市",
    "ProID": 20,
    "CitySort": 260,
    "value": "文昌市"
  }, {"CityID": 261, "label": "万宁市", "ProID": 20, "CitySort": 261, "value": "万宁市"}, {
    "CityID": 262,
    "label": "东方市",
    "ProID": 20,
    "CitySort": 262,
    "value": "东方市"
  }, {"CityID": 263, "label": "澄迈县", "ProID": 20, "CitySort": 263, "value": "澄迈县"}, {
    "CityID": 264,
    "label": "定安县",
    "ProID": 20,
    "CitySort": 264,
    "value": "定安县"
  }, {"CityID": 265, "label": "屯昌县", "ProID": 20, "CitySort": 265, "value": "屯昌县"}, {
    "CityID": 266,
    "label": "临高县",
    "ProID": 20,
    "CitySort": 266,
    "value": "临高县"
  }, {"CityID": 267, "label": "白沙黎族自治县", "ProID": 20, "CitySort": 267, "value": "白沙黎族自治县"}, {
    "CityID": 268,
    "label": "昌江黎族自治县",
    "ProID": 20,
    "CitySort": 268,
    "value": "昌江黎族自治县"
  }, {"CityID": 269, "label": "乐东黎族自治县", "ProID": 20, "CitySort": 269, "value": "乐东黎族自治县"}, {
    "CityID": 270,
    "label": "陵水黎族自治县",
    "ProID": 20,
    "CitySort": 270,
    "value": "陵水黎族自治县"
  }, {"CityID": 271, "label": "保亭黎族苗族自治县", "ProID": 20, "CitySort": 271, "value": "保亭黎族苗族自治县"}, {
    "CityID": 272,
    "label": "琼中黎族苗族自治县",
    "ProID": 20,
    "CitySort": 272,
    "value": "琼中黎族苗族自治县"
  }],
  "value": "海南省"
}, {
  "ProID": 21,
  "label": "广西壮族自治区",
  "ProSort": 28,
  "ProRemark": "自治区",
  "children": [{"CityID": 307, "label": "防城港市", "ProID": 21, "CitySort": 307, "value": "防城港市"}, {
    "CityID": 308,
    "label": "南宁市",
    "ProID": 21,
    "CitySort": 308,
    "value": "南宁市"
  }, {"CityID": 309, "label": "崇左市", "ProID": 21, "CitySort": 309, "value": "崇左市"}, {
    "CityID": 310,
    "label": "来宾市",
    "ProID": 21,
    "CitySort": 310,
    "value": "来宾市"
  }, {"CityID": 311, "label": "柳州市", "ProID": 21, "CitySort": 311, "value": "柳州市"}, {
    "CityID": 312,
    "label": "桂林市",
    "ProID": 21,
    "CitySort": 312,
    "value": "桂林市"
  }, {"CityID": 313, "label": "梧州市", "ProID": 21, "CitySort": 313, "value": "梧州市"}, {
    "CityID": 314,
    "label": "贺州市",
    "ProID": 21,
    "CitySort": 314,
    "value": "贺州市"
  }, {"CityID": 315, "label": "贵港市", "ProID": 21, "CitySort": 315, "value": "贵港市"}, {
    "CityID": 316,
    "label": "玉林市",
    "ProID": 21,
    "CitySort": 316,
    "value": "玉林市"
  }, {"CityID": 317, "label": "百色市", "ProID": 21, "CitySort": 317, "value": "百色市"}, {
    "CityID": 318,
    "label": "钦州市",
    "ProID": 21,
    "CitySort": 318,
    "value": "钦州市"
  }, {"CityID": 319, "label": "河池市", "ProID": 21, "CitySort": 319, "value": "河池市"}, {
    "CityID": 320,
    "label": "北海市",
    "ProID": 21,
    "CitySort": 320,
    "value": "北海市"
  }],
  "value": "广西壮族自治区"
}, {
  "ProID": 22,
  "label": "甘肃省",
  "ProSort": 21,
  "ProRemark": "省份",
  "children": [{"CityID": 211, "label": "兰州市", "ProID": 22, "CitySort": 211, "value": "兰州市"}, {
    "CityID": 212,
    "label": "金昌市",
    "ProID": 22,
    "CitySort": 212,
    "value": "金昌市"
  }, {"CityID": 213, "label": "白银市", "ProID": 22, "CitySort": 213, "value": "白银市"}, {
    "CityID": 214,
    "label": "天水市",
    "ProID": 22,
    "CitySort": 214,
    "value": "天水市"
  }, {"CityID": 215, "label": "嘉峪关市", "ProID": 22, "CitySort": 215, "value": "嘉峪关市"}, {
    "CityID": 216,
    "label": "武威市",
    "ProID": 22,
    "CitySort": 216,
    "value": "武威市"
  }, {"CityID": 217, "label": "张掖市", "ProID": 22, "CitySort": 217, "value": "张掖市"}, {
    "CityID": 218,
    "label": "平凉市",
    "ProID": 22,
    "CitySort": 218,
    "value": "平凉市"
  }, {"CityID": 219, "label": "酒泉市", "ProID": 22, "CitySort": 219, "value": "酒泉市"}, {
    "CityID": 220,
    "label": "庆阳市",
    "ProID": 22,
    "CitySort": 220,
    "value": "庆阳市"
  }, {"CityID": 221, "label": "定西市", "ProID": 22, "CitySort": 221, "value": "定西市"}, {
    "CityID": 222,
    "label": "陇南市",
    "ProID": 22,
    "CitySort": 222,
    "value": "陇南市"
  }, {"CityID": 223, "label": "临夏回族自治州", "ProID": 22, "CitySort": 223, "value": "临夏回族自治州"}, {
    "CityID": 224,
    "label": "甘南藏族自治州",
    "ProID": 22,
    "CitySort": 224,
    "value": "甘南藏族自治州"
  }],
  "value": "甘肃省"
}, {
  "ProID": 23,
  "label": "陕西省",
  "ProSort": 27,
  "ProRemark": "省份",
  "children": [{"CityID": 297, "label": "西安市", "ProID": 23, "CitySort": 297, "value": "西安市"}, {
    "CityID": 298,
    "label": "咸阳市",
    "ProID": 23,
    "CitySort": 298,
    "value": "咸阳市"
  }, {"CityID": 299, "label": "延安市", "ProID": 23, "CitySort": 299, "value": "延安市"}, {
    "CityID": 300,
    "label": "榆林市",
    "ProID": 23,
    "CitySort": 300,
    "value": "榆林市"
  }, {"CityID": 301, "label": "渭南市", "ProID": 23, "CitySort": 301, "value": "渭南市"}, {
    "CityID": 302,
    "label": "商洛市",
    "ProID": 23,
    "CitySort": 302,
    "value": "商洛市"
  }, {"CityID": 303, "label": "安康市", "ProID": 23, "CitySort": 303, "value": "安康市"}, {
    "CityID": 304,
    "label": "汉中市",
    "ProID": 23,
    "CitySort": 304,
    "value": "汉中市"
  }, {"CityID": 305, "label": "宝鸡市", "ProID": 23, "CitySort": 305, "value": "宝鸡市"}, {
    "CityID": 306,
    "label": "铜川市",
    "ProID": 23,
    "CitySort": 306,
    "value": "铜川市"
  }],
  "value": "陕西省"
}, {
  "ProID": 24,
  "label": "新 疆维吾尔自治区",
  "ProSort": 31,
  "ProRemark": "自治区",
  "children": [{"CityID": 333, "label": "塔城地区", "ProID": 24, "CitySort": 333, "value": "塔城地区"}, {
    "CityID": 334,
    "label": "哈密地区",
    "ProID": 24,
    "CitySort": 334,
    "value": "哈密地区"
  }, {"CityID": 335, "label": "和田地区", "ProID": 24, "CitySort": 335, "value": "和田地区"}, {
    "CityID": 336,
    "label": "阿勒泰地区",
    "ProID": 24,
    "CitySort": 336,
    "value": "阿勒泰地区"
  }, {"CityID": 337, "label": "克孜勒苏柯尔克孜自治州", "ProID": 24, "CitySort": 337, "value": "克孜勒苏柯尔克孜自治州"}, {
    "CityID": 338,
    "label": "博尔塔拉蒙古自治州",
    "ProID": 24,
    "CitySort": 338,
    "value": "博尔塔拉蒙古自治州"
  }, {"CityID": 339, "label": "克拉玛依市", "ProID": 24, "CitySort": 339, "value": "克拉玛依市"}, {
    "CityID": 340,
    "label": "乌鲁木齐市",
    "ProID": 24,
    "CitySort": 340,
    "value": "乌鲁木齐市"
  }, {"CityID": 341, "label": "石河子市", "ProID": 24, "CitySort": 341, "value": "石河子市"}, {
    "CityID": 342,
    "label": "昌吉回族自治州",
    "ProID": 24,
    "CitySort": 342,
    "value": "昌吉回族自治州"
  }, {"CityID": 343, "label": "五家渠市", "ProID": 24, "CitySort": 343, "value": "五家渠市"}, {
    "CityID": 344,
    "label": "吐鲁番地区",
    "ProID": 24,
    "CitySort": 344,
    "value": "吐鲁番地区"
  }, {"CityID": 345, "label": "巴音郭楞蒙古自治州", "ProID": 24, "CitySort": 345, "value": "巴音郭楞蒙古自治州"}, {
    "CityID": 346,
    "label": "阿克苏地区",
    "ProID": 24,
    "CitySort": 346,
    "value": "阿克苏地区"
  }, {"CityID": 347, "label": "阿拉尔市", "ProID": 24, "CitySort": 347, "value": "阿拉尔市"}, {
    "CityID": 348,
    "label": "喀什地区",
    "ProID": 24,
    "CitySort": 348,
    "value": "喀什地区"
  }, {"CityID": 349, "label": "图木舒克市", "ProID": 24, "CitySort": 349, "value": "图木舒克市"}, {
    "CityID": 350,
    "label": "伊犁哈萨克自治州",
    "ProID": 24,
    "CitySort": 350,
    "value": "伊犁哈萨克自治州"
  }],
  "value": "新 疆维吾尔自治区"
}, {
  "ProID": 25,
  "label": "青海省",
  "ProSort": 26,
  "ProRemark": "省份",
  "children": [{"CityID": 289, "label": "海北藏族自治州", "ProID": 25, "CitySort": 289, "value": "海北藏族自治州"}, {
    "CityID": 290,
    "label": "西宁市",
    "ProID": 25,
    "CitySort": 290,
    "value": "西宁市"
  }, {"CityID": 291, "label": "海东地区", "ProID": 25, "CitySort": 291, "value": "海东地区"}, {
    "CityID": 292,
    "label": "黄南藏族自治州",
    "ProID": 25,
    "CitySort": 292,
    "value": "黄南藏族自治州"
  }, {"CityID": 293, "label": "海南藏族自治州", "ProID": 25, "CitySort": 293, "value": "海南藏族自治州"}, {
    "CityID": 294,
    "label": "果洛藏族自治州",
    "ProID": 25,
    "CitySort": 294,
    "value": "果洛藏族自治州"
  }, {"CityID": 295, "label": "玉树藏族自治州", "ProID": 25, "CitySort": 295, "value": "玉树藏族自治州"}, {
    "CityID": 296,
    "label": "海西蒙古族藏族自治州",
    "ProID": 25,
    "CitySort": 296,
    "value": "海西蒙古族藏族自治州"
  }],
  "value": "青海省"
}, {
  "ProID": 26,
  "label": "宁夏回族自治区",
  "ProSort": 30,
  "ProRemark": "自治区",
  "children": [{"CityID": 328, "label": "银川市", "ProID": 26, "CitySort": 328, "value": "银川市"}, {
    "CityID": 329,
    "label": "石嘴山市",
    "ProID": 26,
    "CitySort": 329,
    "value": "石嘴山市"
  }, {"CityID": 330, "label": "吴忠市", "ProID": 26, "CitySort": 330, "value": "吴忠市"}, {
    "CityID": 331,
    "label": "固原市",
    "ProID": 26,
    "CitySort": 331,
    "value": "固原市"
  }, {"CityID": 332, "label": "中卫市", "ProID": 26, "CitySort": 332, "value": "中卫市"}],
  "value": "宁夏回族自治区"
}, {
  "ProID": 27,
  "label": "重庆",
  "ProSort": 4,
  "ProRemark": "直辖市",
  "children": [{"CityID": 4, "label": "重庆市", "ProID": 27, "CitySort": 4, "value": "重庆市"}],
  "value": "重庆"
}, {
  "ProID": 28,
  "label": "四川省",
  "ProSort": 22,
  "ProRemark": "省份",
  "children": [{"CityID": 225, "label": "成都市", "ProID": 28, "CitySort": 225, "value": "成都市"}, {
    "CityID": 226,
    "label": "攀枝花市",
    "ProID": 28,
    "CitySort": 226,
    "value": "攀枝花市"
  }, {"CityID": 227, "label": "自贡市", "ProID": 28, "CitySort": 227, "value": "自贡市"}, {
    "CityID": 228,
    "label": "绵阳市",
    "ProID": 28,
    "CitySort": 228,
    "value": "绵阳市"
  }, {"CityID": 229, "label": "南充市", "ProID": 28, "CitySort": 229, "value": "南充市"}, {
    "CityID": 230,
    "label": "达州市",
    "ProID": 28,
    "CitySort": 230,
    "value": "达州市"
  }, {"CityID": 231, "label": "遂宁市", "ProID": 28, "CitySort": 231, "value": "遂宁市"}, {
    "CityID": 232,
    "label": "广安市",
    "ProID": 28,
    "CitySort": 232,
    "value": "广安市"
  }, {"CityID": 233, "label": "巴中市", "ProID": 28, "CitySort": 233, "value": "巴中市"}, {
    "CityID": 234,
    "label": "泸州市",
    "ProID": 28,
    "CitySort": 234,
    "value": "泸州市"
  }, {"CityID": 235, "label": "宜宾市", "ProID": 28, "CitySort": 235, "value": "宜宾市"}, {
    "CityID": 236,
    "label": "资阳市",
    "ProID": 28,
    "CitySort": 236,
    "value": "资阳市"
  }, {"CityID": 237, "label": "内江市", "ProID": 28, "CitySort": 237, "value": "内江市"}, {
    "CityID": 238,
    "label": "乐山市",
    "ProID": 28,
    "CitySort": 238,
    "value": "乐山市"
  }, {"CityID": 239, "label": "眉山市", "ProID": 28, "CitySort": 239, "value": "眉山市"}, {
    "CityID": 240,
    "label": "凉山彝族自治州",
    "ProID": 28,
    "CitySort": 240,
    "value": "凉山彝族自治州"
  }, {"CityID": 241, "label": "雅安市", "ProID": 28, "CitySort": 241, "value": "雅安市"}, {
    "CityID": 242,
    "label": "甘孜藏族自治州",
    "ProID": 28,
    "CitySort": 242,
    "value": "甘孜藏族自治州"
  }, {"CityID": 243, "label": "阿坝藏族羌族自治州", "ProID": 28, "CitySort": 243, "value": "阿坝藏族羌族自治州"}, {
    "CityID": 244,
    "label": "德阳市",
    "ProID": 28,
    "CitySort": 244,
    "value": "德阳市"
  }, {"CityID": 245, "label": "广元市", "ProID": 28, "CitySort": 245, "value": "广元市"}],
  "value": "四川省"
}, {
  "ProID": 29,
  "label": "贵州省",
  "ProSort": 23,
  "ProRemark": "省份",
  "children": [{"CityID": 246, "label": "贵阳市", "ProID": 29, "CitySort": 246, "value": "贵阳市"}, {
    "CityID": 247,
    "label": "遵义市",
    "ProID": 29,
    "CitySort": 247,
    "value": "遵义市"
  }, {"CityID": 248, "label": "安顺市", "ProID": 29, "CitySort": 248, "value": "安顺市"}, {
    "CityID": 249,
    "label": "黔南布依族苗族自治州",
    "ProID": 29,
    "CitySort": 249,
    "value": "黔南布依族苗族自治州"
  }, {"CityID": 250, "label": "黔东南苗族侗族自治州", "ProID": 29, "CitySort": 250, "value": "黔东南苗族侗族自治州"}, {
    "CityID": 251,
    "label": "铜仁地区",
    "ProID": 29,
    "CitySort": 251,
    "value": "铜仁地区"
  }, {"CityID": 252, "label": "毕节地区", "ProID": 29, "CitySort": 252, "value": "毕节地区"}, {
    "CityID": 253,
    "label": "六盘水市",
    "ProID": 29,
    "CitySort": 253,
    "value": "六盘水市"
  }, {"CityID": 254, "label": "黔西南布依族苗族自治州", "ProID": 29, "CitySort": 254, "value": "黔西南布依族苗族自治州"}],
  "value": "贵州省"
}, {
  "ProID": 30,
  "label": "云南省",
  "ProSort": 25,
  "ProRemark": "省份",
  "children": [{"CityID": 273, "label": "西双版纳傣族自治州", "ProID": 30, "CitySort": 273, "value": "西双版纳傣族自治州"}, {
    "CityID": 274,
    "label": "德宏傣族景颇族自治州",
    "ProID": 30,
    "CitySort": 274,
    "value": "德宏傣族景颇族自治州"
  }, {"CityID": 275, "label": "昭通市", "ProID": 30, "CitySort": 275, "value": "昭通市"}, {
    "CityID": 276,
    "label": "昆明市",
    "ProID": 30,
    "CitySort": 276,
    "value": "昆明市"
  }, {"CityID": 277, "label": "大理白族自治州", "ProID": 30, "CitySort": 277, "value": "大理白族自治州"}, {
    "CityID": 278,
    "label": "红河哈尼族彝族自治州",
    "ProID": 30,
    "CitySort": 278,
    "value": "红河哈尼族彝族自治州"
  }, {"CityID": 279, "label": "曲靖市", "ProID": 30, "CitySort": 279, "value": "曲靖市"}, {
    "CityID": 280,
    "label": "保山市",
    "ProID": 30,
    "CitySort": 280,
    "value": "保山市"
  }, {"CityID": 281, "label": "文山壮族苗族自治州", "ProID": 30, "CitySort": 281, "value": "文山壮族苗族自治州"}, {
    "CityID": 282,
    "label": "玉溪市",
    "ProID": 30,
    "CitySort": 282,
    "value": "玉溪市"
  }, {"CityID": 283, "label": "楚雄彝族自治州", "ProID": 30, "CitySort": 283, "value": "楚雄彝族自治州"}, {
    "CityID": 284,
    "label": "普洱市",
    "ProID": 30,
    "CitySort": 284,
    "value": "普洱市"
  }, {"CityID": 285, "label": "临沧市", "ProID": 30, "CitySort": 285, "value": "临沧市"}, {
    "CityID": 286,
    "label": "怒江傈傈族自治州",
    "ProID": 30,
    "CitySort": 286,
    "value": "怒江傈傈族自治州"
  }, {"CityID": 287, "label": "迪庆藏族自治州", "ProID": 30, "CitySort": 287, "value": "迪庆藏族自治州"}, {
    "CityID": 288,
    "label": "丽江市",
    "ProID": 30,
    "CitySort": 288,
    "value": "丽江市"
  }],
  "value": "云南省"
}, {
  "ProID": 31,
  "label": "西藏自治区",
  "ProSort": 29,
  "ProRemark": "自治区",
  "children": [{"CityID": 321, "label": "拉萨市", "ProID": 31, "CitySort": 321, "value": "拉萨市"}, {
    "CityID": 322,
    "label": "日喀则地区",
    "ProID": 31,
    "CitySort": 322,
    "value": "日喀则地区"
  }, {"CityID": 323, "label": "山南地区", "ProID": 31, "CitySort": 323, "value": "山南地区"}, {
    "CityID": 324,
    "label": "林芝地区",
    "ProID": 31,
    "CitySort": 324,
    "value": "林芝地区"
  }, {"CityID": 325, "label": "昌都地区", "ProID": 31, "CitySort": 325, "value": "昌都地区"}, {
    "CityID": 326,
    "label": "那曲地区",
    "ProID": 31,
    "CitySort": 326,
    "value": "那曲地区"
  }, {"CityID": 327, "label": "阿里地区", "ProID": 31, "CitySort": 327, "value": "阿里地区"}],
  "value": "西藏自治区"
}, {
  "ProID": 32,
  "label": "台湾省",
  "ProSort": 7,
  "ProRemark": "省份",
  "children": [{"CityID": 363, "label": "台北市", "ProID": 32, "CitySort": 363, "value": "台北市"}, {
    "CityID": 364,
    "label": "高雄市",
    "ProID": 32,
    "CitySort": 364,
    "value": "高雄市"
  }, {"CityID": 365, "label": "基隆市", "ProID": 32, "CitySort": 365, "value": "基隆市"}, {
    "CityID": 366,
    "label": "台中市",
    "ProID": 32,
    "CitySort": 366,
    "value": "台中市"
  }, {"CityID": 367, "label": "台南市", "ProID": 32, "CitySort": 367, "value": "台南市"}, {
    "CityID": 368,
    "label": "新竹市",
    "ProID": 32,
    "CitySort": 368,
    "value": "新竹市"
  }, {"CityID": 369, "label": "嘉义市", "ProID": 32, "CitySort": 369, "value": "嘉义市"}],
  "value": "台湾省"
}, {
  "ProID": 33,
  "label": "澳门特别行政区",
  "ProSort": 33,
  "ProRemark": "特别行政区",
  "children": [{"CityID": 370, "label": "澳门特别行政区", "ProID": 33, "CitySort": 370, "value": "澳门特别行政区"}],
  "value": "澳门特别行政区"
}, {
  "ProID": 34,
  "label": "香港特别行政区",
  "ProSort": 34,
  "ProRemark": "特别行政区",
  "children": [{"CityID": 371, "label": "香港特别行政区", "ProID": 34, "CitySort": 371, "value": "香港特别行政区"}],
  "value": "香港特别行政区"
}]

export {
  provincesOptions
}