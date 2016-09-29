
(function(){
	
	

	var app = angular.module("EmpData", [])
		.controller("MainController", MainController)
		.service("SAPService", SAPService);

	MainController.$inject = ["SAPService", "$scope"];


	function MainController(SAPService, $scope) {
		var ctrl = this;
		ctrl.message = "";
		ctrl.employees = [];
		ctrl.url = "http://www.example.com";
		ctrl.status = false;
		ctrl.error = false;
		
	
		this.findEmps = function() {
			var query = {
				url: this.url,
				pernr: this.pernr,
				email: this.email,
				firstname: this.firstname,
				lastname: this.lastname,
				userid: this.userid,
				job: this.job,
				position: this.position,
				user: this.user,
				pass: this.pass
			};
			ctrl.status = false;
			ctrl.error = false;
			ctrl.message = "Searching...";
			
			SAPService.findEmployees(query).then(function(data){
				//console.log("Promise Resolved");
				ctrl.message = data.length + " results found.";
				ctrl.status = true;
				$scope.$apply(function(){
					ctrl.employees = data;
					
					//console.log(ctrl.employees);
					
				}).catch(function(error){
					ctrl.error = true;
					ctrl.message = "Error finding employees";
					console.log(error);
				});
					
				
				
				
			});
			
		
			
		};
	}

	
	SAPService.$inject = ["$http"];

	function SAPService($http) {
	
		service = this;
	
		service.findEmployees = function(query) {
			var url = query.url;
			var sr = '<?xml version="1.0" encoding="utf-8"?>' + 
				'<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope" xmlns:urn="urn:sap-com:document:sap:soap:functions:mc-style">' + 
				' <soap:Header/><soap:Body>' + 
				'<urn:ZwsEmployeeSearch>';
				if (!angular.isUndefined(query.pernr)) sr += '<Pernr>'+ query.pernr  +'</Pernr>';
				if (!angular.isUndefined(query.email)) sr += '<Email>' + query.email+'</Email>'; 
				if (!angular.isUndefined(query.firstname)) sr += '<FirstName>'+query.firstname+'</FirstName>';
				if (!angular.isUndefined(query.lastname)) sr += '<LastName>'+query.lastname+'</LastName>';
				if (!angular.isUndefined(query.userid)) sr += '<Userid>'+query.userid+'</Userid>';
				if (!angular.isUndefined(query.job)) sr += '<Job>'+query.job+'</Job>';
				if (!angular.isUndefined(query.position)) sr += '<PositionNo>'+query.position+'</PositionNo>';
				sr  += '</urn:ZwsEmployeeSearch>' +'</soap:Body>' + '</soap:Envelope>';
		
			//console.log(btoa($scope.user + ":" + $scope.pass));
			$http.defaults.headers.common.Authorization = "Basic " + btoa(query.user + ":" + query.pass);
			//$http.defaults.headers.common.Content-Type = 
			var req = {
				method: 'POST',
				url: url,
				data: sr,
				headers: {
					'Content-Type' : 'application/soap+xml;charset=UTF-8;action="urn:sap-com:document:sap:soap:functions:mc-style:ZWS_EMPLOYEE_SEARCH:ZwsEmployeeSearchRequest"'
				}
			};
			
			return new Promise(function(resolve,reject){
				$http(req).then(function(data){
					//return 
					var response = processSoap(data.data);
					resolve(response);
					
			
				}, function(error){
					console.log(error);
					reject(error);
					
				});
		
				
			});
			
			
		};
		
		function processSoap(data) {
			var parser = new DOMParser();
			xmlDoc = parser.parseFromString(data, "text/xml");
			
			var msg = xmlDoc.getElementsByTagName("Message")[0].childNodes[0].nodeValue;
			
			//alert(msg);
			
			//$scope.message = msg;
			console.log(msg);
			var results = xmlDoc.getElementsByTagName("item");
			
			var emps = [];
			
			for(var i = 0; i < results.length; i++) {
				
				var resultArry = Array.prototype.slice.call(results[i].childNodes);
				//console.log(resultArry);
				var emp = {
					
				};
				for(var j = 0; j < resultArry.length; j++) {	
					//console.log("Checking an employee");
					switch(resultArry[j].localName) {
						case "Perno":
							emp.pernr = resultArry[j].textContent;
							break;
						case "Name":
							emp.name = resultArry[j].textContent;
							break;
						case "Email":
							emp.email = resultArry[j].textContent;
							break;
						case "Userid":
							emp.userid = resultArry[j].textContent;
							break;
						case "Area":
							emp.area = resultArry[j].textContent;
							break;
						case "Group":
							emp.group = resultArry[j].textContent;
							break;
						case "PositionNo":
							emp.position = resultArry[j].textContent;
							break;
						case "Job":
							emp.job = resultArry[j].textContent;
							break;
						case "Hire":
							emp.hire = resultArry[j].textContent;
							break;
						case "Rehire":
							emp.rehire = resultArry[j].textContent;
							break;
						case "Term":
							emp.term = resultArry[j].textContent;
							break;
						case "MgrName":
							emp.mgrName = resultArry[j].textContent;
							break;
						case "MgrPerno":
							emp.mgrPerno = resultArry[j].textContent;
							break;
						case "EmploymentStatus":
							emp.status = resultArry[j].textContent;
							break;
					}
					
				}
				
				emps.push(emp);
				
								
			}
			
			
			//console.log(emps);
			
			return emps;
		
		}
	}


})();