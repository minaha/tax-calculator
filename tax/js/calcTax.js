"use strict";

var Tax = (function(){
  //http://www.city.hikone.shiga.jp/somubu/zeimu/shiminzei/juminzei_koujyo_mi.html
  //http://www.city.nasushiobara.lg.jp/faq/288/001451.html
  function calcIncomeTax(c){
    //http://www.nta.go.jp/taxanswer/shotoku/2260.htm

    if(c<=1950000){
      return {amount:c*5/100, rate:5};
    }
    if(c<=3300000){
      return {amount:(c-97500)*10/100, rate:10};
    }
    if(c<=6950000){
      return {amount:(c-427500)*20/100, rate:20};
    }
    if(c<=9000000){
      return {amount:(c-636000)*23/100, rate:23};
    }
    if(c<=18000000){
      return {amount:(c-1536000)*33/100, rate:30};
    }
    return   {amount:(c-2796000)*40/100, rate:40};
  }

  function calcSalaryIncome(fullSalaryIncome){
    //@input 給与収入の合計額
    //@return 給与所得控除後の金額
    //
    //http://www.nta.go.jp/taxanswer/shotoku/1410.htm
    //http://www.city.taito.lg.jp/index/kurashi/zeikin/zeikin/shurui/juminzei.html

    var a = fullSalaryIncome;
    var b;
    if(a<651000){
      b=0;
    }else if(a<1619000){
      b=a-650000;
    }else if(a<1620000){
      b=969000;
    }else if(a<1622000){
      b=970000;
    }else if(a<1624000){
      b=972000;
    }else if(a<1628000){
      b=974000;
    }else if(a<1800000){
      b=Math.floor(a/4000)*2400;
    }else if(a<3600000){
      b=Math.floor(a/4000)*2800-180000;
    }else if(a<6600000){
      b=Math.floor(a/4000)*3200-540000;
    }else if(a<10000000){
      b=a*90/100-1200000;
    }else if(a<15000000){
      b=a*95/100-1700000;
    }else{
      b=a-2450000;
    }
    return b;
  }

  function calcDeduction(b, StudentDeduction){
    //http://www.nta.go.jp/taxanswer/shotoku/shoto320.htm
    //
    var koujo  = 380000;
    if(StudentDeduction){
      koujo += 270000;
    }
    return koujo;
  }

  function isStudentDeduction(b,c){
    if(b<=650000 && c<=100000){
      return true;
    }
    return false;
  }

  function calcTaxableIncome(b,c){
    var ret = b-c;
    if(ret<0)ret=0;
    return ret;
  }

  return {
    calcSalaryIncome:calcSalaryIncome,
    calcDeduction:calcDeduction,
    calcIncomeTax:calcIncomeTax,
    calcTaxableIncome:calcTaxableIncome,
    isStudentDeduction:isStudentDeduction
  }

})();


function TaxCtrl($scope) {
  $scope.tax = {
    //status
    'yourFullSalaryIncome':1000000,
    'yourSalaryIncome':350000,
    'yourOtherIncome':0,
    'yourIncome':350000,
    'yourStudentDeduction':true,

    //所得税
    'yourTaxableIncome':0,
    'yourDeduction':0,//控除額
    'yourIncomeTaxRate':5,
    'yourIncomeTax':0,

    //住民税
    'yourResidentTaxableDeduction':0,//控除額
    'yourResidentTaxableIncome':0,
    'under20':false,
    'yourResidentTaxableNeed': false,
    'yourInhabitantTaxOnPerCapitaBasis':0,
    'yourInhabitantTax':0,


    //親関係status
    'under22':false,
    'yourParentTaxableIncome':10000000,
    'yourParentIncomeTaxRate':30,
    'yourParentIncomeTaxDeduction':0,
    'yourParentInhabitantTaxDeduction':0,
    'yourParentIncrementTax':0


  };
  
  $scope.$watch('tax.yourFullSalaryIncome', function(newValue, oldValue) {
    $scope.tax.yourSalaryIncome = Tax.calcSalaryIncome(newValue);
    $scope.tax.yourIncome = $scope.tax.yourSalaryIncome + $scope.tax.yourOtherIncome;
    $scope.tax.yourStudentDeduction = Tax.isStudentDeduction($scope.tax.yourIncome, $scope.tax.yourOtherIncome);
    $scope.tax.yourDeduction = Tax.calcDeduction($scope.tax.yourIncome, $scope.tax.yourStudentDeduction);
    $scope.tax.yourTaxableIncome = Tax.calcTaxableIncome($scope.tax.yourIncome, $scope.tax.yourDeduction);

    $scope.tax.yourIncomeTaxRate = Tax.calcIncomeTax(newValue).rate;
    $scope.tax.yourIncomeTax = Tax.calcIncomeTax($scope.tax.yourTaxableIncome).amount;

    $scope.tax.yourResidentTaxableDeduction = $scope.tax.yourStudentDeduction ? 590000:330000;
    $scope.tax.yourResidentTaxableIncome = Tax.calcTaxableIncome($scope.tax.yourIncome,$scope.tax.yourResidentTaxableDeduction);
    $scope.tax.yourResidentTaxableNeed = ($scope.tax.under20 || $scope.tax.yourIncome<=350000)? false:true;
    $scope.tax.yourInhabitantTaxOnPerCapitaBasis = $scope.tax.yourResidentTaxableNeed? 4000:0;
    $scope.tax.yourInhabitantTax = $scope.tax.yourInhabitantTaxOnPerCapitaBasis + ($scope.tax.yourResidentTaxableNeed? ($scope.tax.yourResidentTaxableIncome*0.1):0);


    $scope.tax.yourParentIncrementTax = ($scope.tax.yourIncome <=380000? 0:($scope.tax.yourParentInhabitantTaxDeduction*0.1 + $scope.tax.yourParentIncomeTaxDeduction * $scope.tax.yourParentIncomeTaxRate/100));

  });

  $scope.$watch('tax.yourParentTaxableIncome', function(newValue, oldValue) {
    $scope.tax.yourParentIncomeTaxRate = Tax.calcIncomeTax(newValue).rate;
    $scope.tax.yourParentIncomeTaxDeduction = $scope.tax.under22 ? 630000: 380000;
    $scope.tax.yourParentInhabitantTaxDeduction = $scope.tax.under22 ? 450000: 330000;
    $scope.tax.yourParentIncrementTax = ($scope.tax.yourIncome <=380000? 0:($scope.tax.yourParentInhabitantTaxDeduction*0.1 + $scope.tax.yourParentIncomeTaxDeduction * $scope.tax.yourParentIncomeTaxRate/100));
  });

  $scope.$watch('tax.under22', function(newValue, oldValue) {
    $scope.tax.yourParentIncomeTaxDeduction = $scope.tax.under22 ? 630000: 380000;
    $scope.tax.yourParentInhabitantTaxDeduction = $scope.tax.under22 ? 450000: 330000;
    $scope.tax.yourParentIncrementTax = ($scope.tax.yourIncome <=380000? 0:($scope.tax.yourParentInhabitantTaxDeduction*0.1 + $scope.tax.yourParentIncomeTaxDeduction * $scope.tax.yourParentIncomeTaxRate/100));

  });

  $scope.$watch('tax.under20',function(newValue, oldValue){
    $scope.tax.yourResidentTaxableNeed = ($scope.tax.under20 || $scope.tax.yourIncome<=350000)? false:true;
    $scope.tax.yourInhabitantTaxOnPerCapitaBasis = $scope.tax.yourResidentTaxableNeed? 4000:0;
    $scope.tax.yourInhabitantTax = $scope.tax.yourInhabitantTaxOnPerCapitaBasis + ($scope.tax.yourResidentTaxableNeed? ($scope.tax.yourResidentTaxableIncome*0.1):0);
  });

}
