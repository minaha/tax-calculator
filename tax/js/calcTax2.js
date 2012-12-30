"use strict";

var Tax = (function(){
  //http://www.city.hikone.shiga.jp/somubu/zeimu/shiminzei/juminzei_koujyo_mi.html
  //http://www.city.nasushiobara.lg.jp/faq/288/001451.html
  function calcIncomeTax(taxableIncome){
    //http://www.nta.go.jp/taxanswer/shotoku/2260.htm
    var a = taxableIncome;
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

  function calcSalaryIncome(fullSalaryIncome){
    //@input 給与収入の合計額
    //@return 給与所得控除後の金額
    //
    //http://www.nta.go.jp/taxanswer/shotoku/1410.htm
    //http://www.city.taito.lg.jp/index/kurashi/zeikin/zeikin/shurui/juminzei.html

    var a = fullSalaryIncome;
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
      return a*90/100-1200000;
    }else if(a<15000000){
      return a*95/100-1700000;
    }else{
      return a-2450000;
    }
  }

  function calcDeduction(income, studentDeduction){
    //http://www.nta.go.jp/taxanswer/shotoku/shoto320.htm
    //
    var deduction  = 380000;
    if(studentDeduction){
      deduction += 270000;
    }
    return deduction;
  }

  function isStudentDeduction(income, otherIncome){
    if(income<=650000 && otherIncome<=100000){
      return true;
    }
    return false;
  }

  function calcTaxableIncome(income,deduction){
    var ret = income-deduction;
    return ret>0 ? ret:0;
  }

  function calcIncome(salaryIncome, otherIncome){

    return salaryIncome + otherIncome;
  }

  function calcParentIncrementTax(income, parentInhabitantTaxDeduction, parentIncomeTaxDeduction, parentIncomeTaxRate){
    return income <=380000? 0:(parentInhabitantTaxDeduction*0.1 + parentIncomeTaxDeduction * parentIncomeTaxRate/100);
  }

  function calcTransitionalInsuranceIncome(insuranceIncome, ResidentTaxableIncome, inhabitantTax){
    if(inhabitantTax==0){
      return insuranceIncome * 25/100;
    }

    var diff = insuranceIncome - ResidentTaxableIncome*3/2;
    if(diff<=0){
      return insuranceIncome;
    }

    //賦課のもととなる所得金額が課税標準額の1.5倍を超える場合
    if(ResidentTaxableIncome<=1000000){
      return insuranceIncome - diff*50/100;
    }else{
      return insuranceIncome - diff*25/100;
    }

  }

  function calcMedicalInsurance(insuranceIncome, remitRateOfInsurancePerCapitaBasis){
    var ret = insuranceIncome * 628/10000 + 30000 * (100-remitRateOfInsurancePerCapitaBasis)/100;
    if(ret>510000)ret=510000;
    return Math.floor(ret);
  }

  function calcSupportInsurance(insuranceIncome, remitRateOfInsurancePerCapitaBasis){
    var ret = insuranceIncome * 223/10000 + 10200 * (100-remitRateOfInsurancePerCapitaBasis)/100;
    if(ret>140000)ret=140000;
    return Math.floor(ret);
  }

  return {
    calcSalaryIncome:calcSalaryIncome,
    calcDeduction:calcDeduction,
    calcIncome: calcIncome,
    calcIncomeTax:calcIncomeTax,
    calcTaxableIncome:calcTaxableIncome,
    calcParentIncrementTax:calcParentIncrementTax,
    isStudentDeduction:isStudentDeduction,
    calcTransitionalInsuranceIncome:calcTransitionalInsuranceIncome,
    calcMedicalInsurance:calcMedicalInsurance,
    calcSupportInsurance:calcSupportInsurance
  }

})();



function updateGraph(parentTaxableIncome, under22, under20, len){
  var chart = document.getElementById('chart_div');
  google.load("visualization", "1", {packages:["corechart"]});
  google.setOnLoadCallback(drawChart);


  var data = (function updateData(){

    var tax = {
      'yourSalaryIncome':350000,     //(editable)
      'yourOtherIncome':0,           //editable
      'yourStudentDeduction':true,   //editable

      //所得税

      //住民税
      'yourResidentTaxableDeduction':0,//控除額
      'yourResidentTaxableIncome':0,
      'under20':false,                    //editable


      //親関係status
      'under22':false,                    //editable
      'yourParentTaxableIncome':10000000, //editable
    };
    if(parentTaxableIncome != null)
      tax.yourParentTaxableIncome = parentTaxableIncome;
    if(under22 != null)
      tax.under22 = under22;
    if(under20 != null)
      tax.under20 = under20;  

    var data = [];
    data.push(['収入',　'実質手取', '税額', '保険料']);

    var max = len && len>150? Math.round(len):150;
    var min = len && len<100? Math.round(len):100;
    var interval = Math.ceil((max-min)/200) ;
    for(var i=min;i<=max;i+=interval){
      var income = i * 10000;
      tax.yourFullSalaryIncome = income;

      tax.yourSalaryIncome = Tax.calcSalaryIncome(tax.yourFullSalaryIncome);
      tax.yourIncome = Tax.calcIncome(tax.yourSalaryIncome, tax.yourOtherIncome);

      tax.yourStudentDeduction = Tax.isStudentDeduction(tax.yourIncome, tax.yourOtherIncome);

      tax.yourDeduction = Tax.calcDeduction(tax.yourIncome, tax.yourStudentDeduction);
      tax.yourTaxableIncome = Tax.calcTaxableIncome(tax.yourIncome, tax.yourDeduction);
      tax.yourIncomeTaxRate = Tax.calcIncomeTax(tax.yourTaxableIncome).rate;
      tax.yourIncomeTax = Tax.calcIncomeTax(tax.yourTaxableIncome).amount;

      tax.yourResidentTaxableDeduction = tax.yourStudentDeduction ? 590000:330000;
      tax.yourResidentTaxableIncome = Tax.calcTaxableIncome(tax.yourIncome, tax.yourResidentTaxableDeduction);
      tax.yourResidentTaxableNeed = ((tax.under20&&tax.yourIncome<=1250000) || tax.yourIncome <= 350000)? false:true;
      tax.yourInhabitantTaxOnPerCapitaBasis = tax.yourResidentTaxableNeed? 4000:0;
      tax.yourInhabitantTax = tax.yourInhabitantTaxOnPerCapitaBasis + (tax.yourResidentTaxableNeed? (tax.yourResidentTaxableIncome*0.1):0);

      tax.yourParentIncomeTaxRate = Tax.calcIncomeTax(tax.yourParentTaxableIncome).rate;
      tax.yourParentIncomeTaxDeduction = tax.under22 ? 630000: 380000;
      tax.yourParentInhabitantTaxDeduction = tax.under22 ? 450000: 330000;
      tax.yourParentIncrementTax =  Tax.calcParentIncrementTax(tax.yourIncome, tax.yourParentInhabitantTaxDeduction, tax.yourParentIncomeTaxDeduction, tax.yourParentIncomeTaxRate);


      //保険料
      tax.yourInsuranceCostNeed = tax.yourFullSalaryIncome < 1300000 ? false:true;//130万"未満"

      tax.insuranceIncome = (tax.yourIncome - 330000)<0? 0:(tax.yourIncome - 330000);
      tax.insuranceIncome2 = Tax.calcTransitionalInsuranceIncome(tax.insuranceIncome, tax.yourResidentTaxableIncome, tax.yourInhabitantTax);
      tax.remitRateOfInsurancePerCapitaBasis = (tax.yourIncome <=330000)?70:(tax.yourIncome <=680000)?20:0;
      tax.medicalInsurance = Tax.calcMedicalInsurance(tax.insuranceIncome2, tax.remitRateOfInsurancePerCapitaBasis);
      tax.supportInsurance = Tax.calcSupportInsurance(tax.insuranceIncome2, tax.remitRateOfInsurancePerCapitaBasis);

      tax.insuranceCost = tax.yourInsuranceCostNeed? (tax.medicalInsurance+tax.supportInsurance):0;
      

      var taxSum = tax.yourInhabitantTax + tax.yourIncomeTax + tax.yourParentIncrementTax;
      data.push([income, income-taxSum-tax.insuranceCost, taxSum, tax.insuranceCost]);
    }
    return data;
  })();

  function drawChart() {
    var data2 = google.visualization.arrayToDataTable(data);

    var options = {
      title: '収入-手取グラフ',
      hAxis: {title: 'あなたの収入',  titleTextStyle: {color: 'red'}, },
      vAxis:{maxValue:1400000},
      backgroundColor: 'none',
    };

    var chart = new google.visualization.AreaChart(document.getElementById('chart_div'));
    chart.draw(data2, options);
  }
  if(parentTaxableIncome != null)
    drawChart();
}


function TaxCtrl($scope) {
  $scope.tax = {
    //status
    'yourFullSalaryIncome':1000000,//editable
    'yourSalaryIncome':350000,     //(editable)
    'yourOtherIncome':0,           //editable
    'yourIncome':350000,           
    'yourStudentDeduction':true,   //editable

    //所得税
    'yourTaxableIncome':0,
    'yourDeduction':0,//控除額
    'yourIncomeTaxRate':5,
    'yourIncomeTax':0,

    //住民税
    'yourResidentTaxableDeduction':0,//控除額
    'yourResidentTaxableIncome':0,
    'under20':false,                    //editable
    'yourResidentTaxableNeed': false,
    'yourInhabitantTaxOnPerCapitaBasis':0,
    'yourInhabitantTax':0,

    //国民健康保険料
    'yourInsuranceCostNeed':false,
    'insuranceIncome':0,
    'insuranceIncome2':0,//平成23年,24年のみ。所得比例方式への変更にともなう経過措置
    'remitRateOfInsurancePerCapitaBasis':0,
    'medicalInsurance':0,//医療分保険料
    'supportInsurance':0,//後期高齢者支援金等賦課額
    //介護分保険料(40歳から64歳)
    'insuranceCost':0,
    

    //親関係status
    'under22':false,                    //editable
    'yourParentTaxableIncome':10000000, //editable
    'yourParentIncomeTaxRate':30,
    'yourParentIncomeTaxDeduction':0,
    'yourParentInhabitantTaxDeduction':0,
    'yourParentIncrementTax':0
  };

  function updateIncome(fullSalaryIncome, otherIncome){
    $scope.tax.yourSalaryIncome = Tax.calcSalaryIncome($scope.tax.yourFullSalaryIncome);
    $scope.tax.yourIncome = Tax.calcIncome($scope.tax.yourSalaryIncome, $scope.tax.yourOtherIncome);
  }

  function updateParentTax(income, parentIncomeTaxRate, under22){
    $scope.tax.yourParentIncomeTaxDeduction = $scope.tax.under22 ? 630000: 380000;
    $scope.tax.yourParentInhabitantTaxDeduction = $scope.tax.under22 ? 450000: 330000;
    $scope.tax.yourParentIncrementTax =  Tax.calcParentIncrementTax ($scope.tax.yourIncome, $scope.tax.yourParentInhabitantTaxDeduction, $scope.tax.yourParentIncomeTaxDeduction, $scope.tax.yourParentIncomeTaxRate);
  }

  function updateIncomeTax(income, studentDeduction){
    $scope.tax.yourDeduction = Tax.calcDeduction($scope.tax.yourIncome, $scope.tax.yourStudentDeduction);
    $scope.tax.yourTaxableIncome = Tax.calcTaxableIncome($scope.tax.yourIncome, $scope.tax.yourDeduction);
    $scope.tax.yourIncomeTaxRate = Tax.calcIncomeTax($scope.tax.yourTaxableIncome).rate;
    $scope.tax.yourIncomeTax = Tax.calcIncomeTax($scope.tax.yourTaxableIncome).amount;
  }

  function updateInhabitantTax(income, studentDeduction, under20){
    $scope.tax.yourResidentTaxableDeduction = $scope.tax.yourStudentDeduction ? 590000:330000;
    $scope.tax.yourResidentTaxableIncome = Tax.calcTaxableIncome($scope.tax.yourIncome, $scope.tax.yourResidentTaxableDeduction);
    $scope.tax.yourResidentTaxableNeed = ($scope.tax.under20 && $scope.tax.yourIncome<=1250000 || $scope.tax.yourIncome <= 350000)? false:true;
    $scope.tax.yourInhabitantTaxOnPerCapitaBasis = $scope.tax.yourResidentTaxableNeed? 4000:0;
    $scope.tax.yourInhabitantTax = $scope.tax.yourInhabitantTaxOnPerCapitaBasis + ($scope.tax.yourResidentTaxableNeed? ($scope.tax.yourResidentTaxableIncome*0.1):0);
  }

  function updateInsuranceCost(yourFullSalaryIncome, income, ResidentTaxableIncome, inhabitantTax){
    $scope.tax.yourInsuranceCostNeed = $scope.tax.yourFullSalaryIncome < 1300000 ? false:true;//130万"未満"

    $scope.tax.insuranceIncome = ($scope.tax.yourIncome - 330000)<0? 0:($scope.tax.yourIncome - 330000);
    //平成23年,24年のみ。所得比例方式への変更にともなう経過措置
    $scope.tax.insuranceIncome2 = Tax.calcTransitionalInsuranceIncome($scope.tax.insuranceIncome, $scope.tax.yourResidentTaxableIncome, $scope.tax.yourInhabitantTax);
    $scope.tax.remitRateOfInsurancePerCapitaBasis = ($scope.tax.yourIncome <=330000)?70:($scope.tax.yourIncome <=680000)?20:0;
    $scope.tax.medicalInsurance = Tax.calcMedicalInsurance($scope.tax.insuranceIncome2, $scope.tax.remitRateOfInsurancePerCapitaBasis);
    $scope.tax.supportInsurance = Tax.calcSupportInsurance($scope.tax.insuranceIncome2, $scope.tax.remitRateOfInsurancePerCapitaBasis);

    $scope.tax.insuranceCost = $scope.tax.yourInsuranceCostNeed? ($scope.tax.medicalInsurance+$scope.tax.supportInsurance):0;

  }

  $scope.$watch('tax.yourFullSalaryIncome', function(newValue, oldValue) {
    updateIncome();
    $scope.tax.yourStudentDeduction = Tax.isStudentDeduction($scope.tax.yourIncome, $scope.tax.yourOtherIncome);
    updateIncomeTax();
    updateInhabitantTax();
    updateParentTax();
    updateInsuranceCost();
    updateGraph($scope.tax.yourParentTaxableIncome, $scope.tax.under22, $scope.tax.under20, $scope.tax.yourFullSalaryIncome/10000);
  });

  $scope.$watch('tax.yourParentTaxableIncome', function(newValue, oldValue) {
    $scope.tax.yourParentIncomeTaxRate = Tax.calcIncomeTax($scope.tax.yourParentTaxableIncome).rate;
    updateParentTax();
    updateGraph($scope.tax.yourParentTaxableIncome, $scope.tax.under22, $scope.tax.under20, $scope.tax.yourFullSalaryIncome/10000);
  });

  $scope.$watch('tax.under22', function(newValue, oldValue) {
    updateParentTax();
    updateGraph($scope.tax.yourParentTaxableIncome, $scope.tax.under22, $scope.tax.under20, $scope.tax.yourFullSalaryIncome/10000);
  });

  $scope.$watch('tax.under20',function(newValue, oldValue){
    updateInhabitantTax();
    updateInsuranceCost();
    updateGraph($scope.tax.yourParentTaxableIncome, $scope.tax.under22, $scope.tax.under20, $scope.tax.yourFullSalaryIncome/10000);
  });
}

updateGraph();