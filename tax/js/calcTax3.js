(function(){
  "use strict";

  function Status() {
    var status = {
      fullSalaryIncome:1000000,
      salaryIncome:0,
      otherIncome:0,
      income:0,
      age:21,
      isStudent:true,
      area:"0",
      headCount:0,

      //function
      Age: {},
      Deduction: {},
      Region: {}
    };

    function calcSalaryIncome(fullSalaryIncome){
      //http://www.nta.go.jp/taxanswer/shotoku/1410.htm
      //http://www.city.taito.lg.jp/index/kurashi/zeikin/zeikin/shurui/juminzei.html
      function f(a){
        if(a<651000){
          return 0;
        }else if(a<1619000){
          return a-650000;
        }else if(a<1620000){
          return 969000;
        }else if(a<1622000){
          return 970000;
        }else if(a<1624000){
          return 972000;
        }else if(a<1628000){
          return 974000;
        }else if(a<1800000){
          return Math.floor(a/4000)*2400;
        }else if(a<3600000){
          return Math.floor(a/4000)*2800-180000;
        }else if(a<6600000){
          return Math.floor(a/4000)*3200-540000;
        }else if(a<10000000){
          return Math.floor(a*90/100)-1200000;//floor?
        }else if(a<15000000){
          return Math.floor(a*95/100)-1700000;//floor?
        }else{
          return a-2450000;
        }
      }
      status.salaryIncome = f(status.fullSalaryIncome);
    }

    function calcIncome(salaryIncome, otherIncome){
      status.income = status.salaryIncome + status.otherIncome;
    }

    status.Age = {
      isUnder20:function(){
        return status.age<20;
      },
      is18to22:function(){
        return 18<=status.age && status.age<=22;
      }
    };

    status.Deduction = (function Deduction(){
      //各種控除一覧表
      //http://www.city.hikone.shiga.jp/somubu/zeimu/shiminzei/juminzei_koujyo_mi.html
      //http://www.nta.go.jp/taxanswer/shotoku/shoto320.htm
      var deduction = {
        student: {name:"勤労学生控除", status:true, value:[270000,260000], requirement:studentCheck},
        besic: {name:"基礎控除", status:true, value:[380000,330000], requirement:function(){return true}},
        insurance: {name:"社会保険料控除", status:true, value:[0,0], requirement:setInsurance},
        medical: {name:"医療費控除", status:true, value:[0,0], requirement:function(){}}
      };

      var sum = [];

      function studentCheck(){
        if(status.isStudent && status.income<=650000 && status.otherIncome<=100000){
          return true;
        }
        return false;
      }

      function setInsurance(){

      }

      function update(){
        //_.extend(deduction, updateStatus);
        deduction.student.status = studentCheck();
        var values = _.filter(deduction, function(obj){
          return obj.status;});
        values = _.map(values, function(obj){return obj.value;});
        values = _.reduce(values, function(memo, array){return [memo[0]+array[0], memo[1]+array[1]];});
        sum = values;
      }

      return {
        getSum:function(type){
          if(type=="income"){
            return sum[0];
          }else if(type=="resident"){
            return sum[1];
          }
          return 0;
        },

        getDiff:function(){
          return sum[0]-sum[1];
        },
        studentDeduction:deduction.student,
        update:update
      };
    })();

    status.Region = (function Region(){
      //Areaは予約後
      var region = {

      };

      var areaData = [
      ["東京都", "世田谷区","1_1" , [0,[6.28,0,30000,    0,510000], [2.23,0,10200,    0,140000], [ 1.5,0, 14100,   0,120000],24],[0,""]],
      ["神奈川県", "横浜市","1_1" , [0,[1.48,0,40870,    0,510000], [0.48,0,12550,    0,140000], [0.54,0, 16420,   0,120000],24],[1200,"横浜みどり税,水源環境の保全・再生"]],
      ["大阪府"  , "大阪市","1_1" , [0,[ 7.8,0,19421,33205,510000], [ 2.7,0, 6451,11030,140000], [ 2.4,0,  7185,8890,120000],24],[0,""]],
      ["愛知県" ,"名古屋市","1_1" , [0,[1.18,0,38662,    0,510000], [0.39,0,12215,    0,140000], [0.35,0, 13605,   0,120000],24],[500,"あいち森と緑づくり税"]],
      ["北海道"  , "札幌市","1_2" , [0,[9.48,0,17170,33790,510000], [2.56,0, 4650, 9140,140000], [3.06,0,  5830,8760,120000],24],[0,""]],
      ["兵庫県"  , "神戸市","1_1" , [330000,[14.84,0,24650,27410,510000],[4.57,0,7350,8170,140000],[4.25,0,8300,6690,120000],24],[800,"県民緑税"]],
      ["京都府"  , "京都市","1_1" , [0,[8.99,0,26270,19330,510000], [2.93,0, 8210, 6040,140000], [2.76,0,  9260,4970,120000],24],[0,""]],
      ["福岡県"  , "福岡市","1_2" , [0,[8.21,0,21582,23886,510000], [3.18,0, 7624, 8437,140000], [3.07,0,  8463,6873,120000],24],[500,"森林環境税"]],
      ["神奈川県", "川崎市","1_1" , [0,[6.64,0,15946,20749,510000], [2.56,0, 5475, 7124,140000], [2.35,0,  6115,5626,120000],24],[300,"水源環境保全税"]],
      ["埼玉県" ,"さいたま市","1_1" , [0,[7.49,0,29200,    0,500000], [ 1.9,0, 7400,    0,130000], [ 1.9,0,  8900,   0,100000],24],[0,""]],
      ["広島県"  , "広島市","1_2" , [0,[2.26,0,29540,12818,510000], [ 7.5,0, 9206, 3995,140000], [ 7.8,0, 10540,3273,120000],24],[500,"ひろしまの森づくり県民税"]],
      //["宮城県"  , "仙台市","1_2" , [市県民税額,[144,0,22200,26040,510000],[47,0,6960,8040,140000],[55,0,   7800,6480,120000],24],[0,""]],
      ["福岡県" ,"北九州市","1_2" , [0,[ 6.9,0,19050,24140,510000], [ 2.7,0, 7050, 8930,140000], [ 3.9,0,  8580,8190,120000],24],[500,"森林環境税"]],
      ["千葉県"  , "千葉市","1_2" , [0,[5.81,0,16200,21480,510000], [1.89,0, 5160, 6720,140000], [1.93,0,  7440,5760,120000],24],[0,""]],
      ["大分県"  , "大分市","2_1" , [0,[8.65,0,26500,25700,510000], [2.49,0, 7700, 6900,140000], [ 2.5,0,  8700,5900,120000],24],[500,"森林環境税"]],
      ];

      function getRegionLevel (){

        return areaData[Number(status.area)][2];
      }

      function getResidentCustomTax (){

        //return [500, "森林環境税"];
        return areaData[Number(status.area)][4];
      }

      function getInsurance (){
        return areaData[Number(status.area)][3];
      }

      region.getRegionLevel = getRegionLevel;
      region.getResidentCustomTax = getResidentCustomTax;
      region.getInsurance = getInsurance;
      region.areaData = areaData;
      return region;
    })();


    function update(updateStatus){
      //_.extend(status, updateStatus);
      calcSalaryIncome();
      calcIncome();
      status.Deduction.update();
      //status.Region.update();
    }

    status.update = update;
    return status;
  }

  function IncomeTax(Status){
    var incomeTax = {
      deduction:0,
      taxableIncome:0,
      taxRate:0,
      tax:0
    };

    function calcTaxableIncome(income, deduction){
      incomeTax.taxableIncome = Math.max(Status.income - incomeTax.deduction, 0);
    }

    function calcIncomeTax(taxableIncome){
      function f(a){
        //http://www.nta.go.jp/taxanswer/shotoku/2260.htm
        if(a<=1950000){
          return {amount:a*5/100, rate:5};
        }
        if(a<=3300000){
          return {amount:a*10/100-97500, rate:10};
        }
        if(a<=6950000){
          return {amount:a*20/100-427500, rate:20};
        }
        if(a<=9000000){
          return {amount:a*23/100-636000, rate:23};
        }
        if(a<=18000000){
          return {amount:a*33/100-1536000, rate:30};
        }
        return   {amount:a*40/100-2796000, rate:40};
      }

      var b = f(incomeTax.taxableIncome);
      incomeTax.taxRate = b.rate;
      incomeTax.tax     = Math.floor(b.amount);//todo:floorでいいの？
    }


    function update(status){
      incomeTax.deduction = Status.Deduction.getSum("income");
      calcTaxableIncome();
      calcIncomeTax();
    }

    incomeTax.update = update;
    return incomeTax;
  }

  function ResidentTax(Status){
    var residentTax = {
      needLevel:0,
      deduction:0,
      //tempTaxableIncome:0,
      //tempDeduction:0,
      taxableIncome:0,
      flatTax:0,
      incomeTax:0,
      totalTax:0
    };
    var NONE = 0, ONLY_FLAT_TAX = 1, ALL = 2;

    function getNeedLevel(area, age, income){
      //1月1日現在、生活保護法による生活扶助を受けている人
      //1月1日現在、障害者、未成年者、※寡婦（寡夫）で前年中の合計所得金額が125万円以下の人
      if(Status.Age.isUnder20("1/1") && Status.income <= 1250000){
        return NONE;
      }

      function f(a){
        //均等割非課税限度額
        // [基準額, 加算額]
        switch (a){
          case "1_1":
          case "1_2":
            return [350000, 210000]
          case "2_1":
          case "2_2":
            return [315000, 189000]
          case "3_1":
          case "3_2":
          default:
            return [280000, 168000]
        }
      }


      //総所得金額、総所得金額等、合計所得金額の違い
      //http://www.city.nasushiobara.lg.jp/faq/288/001451.html
      
      //控除対象配偶者＋扶養親族数;
      var dependentCount = 0;
      var level = f(Status.Region.getRegionLevel());

      //前年中の合計所得金額が、次の金額以下の人
      //扶養親族のいる人　35万円×（控除対象配偶者＋扶養親族数＋1）＋21万円
      if(Status.income <= level[0]*(dependentCount+1) + (dependentCount!=0? level[1]:0)) {
        return NONE;
      }
      
      //前年中の総所得金額が、次の金額以下の人
      //扶養親族のいない人　35万円
      //扶養親族のいる人　35万円×（控除対象配偶者＋扶養親族数＋1）＋32万円
      var level2 = [350000, 320000];
      if(Status.income <= level2[0]*(dependentCount+1) + (dependentCount!=0? level2[1]:0)) {
        return ONLY_FLAT_TAX;
      }
      return ALL;
    }

    function calcTaxableIncome(income, deduction){
      var tempTaxableIncome = Math.max(Status.income - residentTax.deduction, 0);


      //調整控除の計算
      var diffDeduction = Status.Deduction.getDiff();
      var tempDeduction = 0;
      if(tempTaxableIncome <= 2000000){
        tempDeduction = Math.min(diffDeduction, tempTaxableIncome) * 5/100;
      }else{
        tempDeduction = (diffDeduction - (tempTaxableIncome-2000000)) * 5/100;
        tempDeduction = Math.max(tempDeduction, 2500);
      }

      //todo: floorでいいの?
      //tempDeduction = Math.floor(tempDeduction);

      //residentTax.tempTaxableIncome = tempTaxableIncome;
      //residentTax.tempDeduction     = tempDeduction;
      residentTax.taxableIncome = Math.max(tempTaxableIncome - tempDeduction, 0);
    }

    function calcFlatTax(area, needLevel){
      if(residentTax.needLevel == NONE){
        residentTax.flatTax = 0;
      } else {
        residentTax.flatTax = 4000 + Status.Region.getResidentCustomTax()[0];
      }
    }

    function calcIncomeTax(taxableIncome, needLevel){
      if(residentTax.needLevel != ALL){
        residentTax.incomeTax = 0;
      } else {
        residentTax.incomeTax = Math.floor(residentTax.taxableIncome * 10/100);
      }
    }

    function getLevel(){
      switch(residentTax.needLevel){
        case NONE:
          return "対象外";
        case ONLY_FLAT_TAX:
          return "均等割のみ";
        case ALL:
        default:
          return "対象";
      }
    }

    function update(){
      residentTax.needLevel = getNeedLevel();
      residentTax.deduction = Status.Deduction.getSum("resident");
      calcTaxableIncome();
      calcFlatTax();
      calcIncomeTax();
      residentTax.totalTax = residentTax.flatTax + residentTax.incomeTax;
    }

    residentTax.update = update;
    residentTax.getLevel = getLevel;
    return residentTax;
  }

  function Insurance(Status){
    var insurance = {
      need: false,
      taxableIncome:0,
      reduction:0,
      medicalInsurance:0,
      supportInsurance:0,
      caringInsurance:0,
      totalTax:0
    };

    function getNeed(fullSalaryIncome){
      //130万"未満"は扶養
      return Status.fullSalaryIncome>=1300000? true:false;
    }

    function calcTaxableIncome(income, area){
      var areaOptions = Status.Region.getInsurance();
      insurance.taxableIncome = Math.max(Status.income - 330000 - areaOptions[0], 0);
    }

    function calcReduction(income, headCount){
      if(Status.income <= (330000 + 350000)){
        insurance.reduction = 20;
      } else {
        insurance.reduction = 0;
      }
    }

    function calcInsuranceTax(area){
      //max((income-330000)*所得割+(均等割*人数+平等割)*(100-軽減率)/100, 賦課限度額)
      var opt = Status.Region.getInsurance();
      if(insurance.need){
        insurance.medicalInsurance = Math.min(insurance.taxableIncome * opt[1][0]/100 + (opt[1][2] + opt[1][3])*(100-insurance.reduction)/100 , opt[1][4]);
        insurance.supportInsurance = Math.min(insurance.taxableIncome * opt[2][0]/100 + (opt[2][2] + opt[2][3])*(100-insurance.reduction)/100 , opt[2][4]);
        insurance.caringInsurance  = 0;//Math.min(insurance.taxableIncome * opt[3][0]/100 + (opt[3][2] + opt[3][3])*(100-insurance.reduction)/100 , opt[3][4]);
        insurance.medicalInsurance = Math.floor(insurance.medicalInsurance);//todo:floor?
        insurance.supportInsurance = Math.floor(insurance.supportInsurance);//todo:floor?
        insurance.caringInsurance  = Math.floor(insurance.caringInsurance);//todo:floor?
      }else{
        insurance.medicalInsurance = insurance.supportInsurance = insurance.caringInsurance = 0;
      }
    }

    function update(){
      insurance.need = getNeed();
      calcTaxableIncome();
      calcReduction();
      calcInsuranceTax();
      insurance.totalTax = insurance.medicalInsurance + insurance.supportInsurance + insurance.caringInsurance;
    }

    insurance.update = update;
    return insurance;
  }

  function ParentStatus(Status){
    var parentStatus = {
      need:false,
      incomeTaxRate:23,
      isEspecialDependent:false,
      incomeTaxDeduction:0,
      residentTaxDeduction:0,
      incrementTax:0
    }

    function calcDeduction(){
      if(!parentStatus.need){
        parentStatus.incomeTaxDeduction   = 0;
        parentStatus.residentTaxDeduction = 0;
      } else if(parentStatus.isEspecialDependent){
        //特定扶養親族
        parentStatus.incomeTaxDeduction   = 630000;
        parentStatus.residentTaxDeduction = 450000;
      } else {
        parentStatus.incomeTaxDeduction   = 380000;
        parentStatus.residentTaxDeduction = 330000;
      }
    }

    function calcIncrementTax(){
      var a = parentStatus.incomeTaxDeduction * parentStatus.incomeTaxRate/100;
      var b = parentStatus.residentTaxDeduction * 10/100;
      parentStatus.incrementTax = (parentStatus.need && parentStatus.incomeTaxRate!=0)?(a + b):0;
    }

    function update(){
      parentStatus.need = (Status.fullSalaryIncome + Status.otherIncome)>1030000? true:false;
      parentStatus.isEspecialDependent = Status.Age.is18to22("12/31");
      calcDeduction();
      calcIncrementTax();
    }

    parentStatus.update = update;
    return parentStatus;
  }

  //Angular.js Controller
  window.TaxCtrl = function ($scope) {
    $scope.Status = Status();
    $scope.IncomeTax = IncomeTax($scope.Status);
    $scope.ResidentTax = ResidentTax($scope.Status);
    $scope.Insurance = Insurance($scope.Status);
    $scope.ParentStatus = ParentStatus($scope.Status);

    function fullUpdate(newValue, oldValue){
      $scope.Status.update();
      $scope.IncomeTax.update();
      $scope.ResidentTax.update();
      $scope.Insurance.update();
      $scope.ParentStatus.update();
      Graph.update($scope.Status, $scope.ParentStatus);
    }

    $scope.$watch('Status.fullSalaryIncome', fullUpdate);
    $scope.$watch('Status.age', fullUpdate);
    $scope.$watch('Status.area', fullUpdate);
    $scope.$watch('ParentStatus.incomeTaxRate', fullUpdate);
  };


  var Graph = (function() {
    var obj = {};
    var chart;
    var callback_flag = false;

    function init(){
      obj.Status = Status();
      obj.Status.fullSalaryIncome = 1000000;
      obj.IncomeTax = IncomeTax(obj.Status);
      obj.ResidentTax = ResidentTax(obj.Status);
      obj.Insurance = Insurance(obj.Status);
      obj.ParentStatus = ParentStatus(obj.Status);

      google.load("visualization", "1", {packages:["corechart"]});
      google.setOnLoadCallback(_callback);
    }

    function _callback(){
      chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
      callback_flag = true;
      _drawChart();
    }

    function _drawChart() {
      if(!callback_flag)
        return;
      var temp = _getData();
      var data = temp[0];
      var pos  = temp[1];
      var dataTable = google.visualization.arrayToDataTable(data);

      var options = {
        title: '収入-手取グラフ',
        hAxis: {title: 'あなたの収入',  titleTextStyle: {color: 'red'}, },
        vAxis:{maxValue:1400000},
        legend: {position: 'in'},
        width:700,
        height:300,
        backgroundColor: 'none',
      };

      chart.draw(dataTable, options);

      chart.setSelection([{row:pos, column:null}]);
    }

    function _getData(){
      var data = [];
      var pos=0;
      data.push(['収入',　'実質手取', '税額', '保険料']);

      var len = Math.round(obj.Status.fullSalaryIncome/10000)||0;
      var max = len>140? Math.floor(len*11/10):150;
      var min = len<100? Math.max(len-10,0):90;
      var interval = Math.ceil((max-min)/200);
      for(var i=min;i<=max;i+=interval){
        obj.Status.fullSalaryIncome = i * 10000;
        _updateData();

        if(i >= len && pos==0){
          pos = Math.floor((i-min)/interval);
        }

        var income = obj.Status.fullSalaryIncome;
        var totalTax = obj.IncomeTax.tax + obj.ResidentTax.totalTax + obj.ParentStatus.incrementTax;
        var insuranceTax = obj.Insurance.totalTax;
        data.push([income, income-totalTax-insuranceTax, totalTax, insuranceTax]);
      }
      return [data, pos];
    }

    function _updateData(){
      obj.Status.update();
      obj.IncomeTax.update();
      obj.ResidentTax.update();
      obj.Insurance.update();
      obj.ParentStatus.update();
    }

    function update(updateStatus, updateParentStatus){
      obj.Status.fullSalaryIncome = updateStatus.fullSalaryIncome;
      obj.Status.age = updateStatus.age;
      obj.Status.area = updateStatus.area;
      obj.ParentStatus.incomeTaxRate = updateParentStatus.incomeTaxRate;
      //_.extend(obj.Status, updateStatus);
      _drawChart();
    }

    return {
      init: init,
      update: update,
    };
  })();

  Graph.init();

})();
