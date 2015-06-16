function readFlyd(){
	this()
}

function readFlydEventually(prev){
	var self= this
	return new Promise(function(resolve, reject){
		if(prev){
			prev.catch(reject)
		}
		flyd.stream([self], function(){
			resolve(self())
		})
		flyd.stream([self.end], function(){
			reject(self.end())
		})
	}
	
}

function promiseToFlyd(f){
	this.then(function(val){
		f(val)
	})
})

function iteratorToFlyd(f){
	for(var item of this){
		f(item)
	}
}

function staticToFlyd(f){
	f(this)
}

function omniToFlyd(f){
	var target
	if(this.then){
		target= promiseToStream
	}else if(this[Symbol.iterator]){
		target= iteratorToStream
	}else{
		target= staticToStream
	}
	target.call(this, f)
}

var toFlyd= {
	omni: omniToStream,
	iterator: iteratorToStream,
	promise: promiseToStream,
	static: staticToStream,
}

function *flydToAsyncGenerator(){
	var self= this|| arguments[0]|| (function(){ throw new Exception() })(),
	  ok= true
	while(ok){
		var val= new Promise(function(resolve, reject){
			flyd.stream([s], function(){
				resolve(self())
			})
			flyd.stream([self.end], function(){
				reject(s.end())
				ok= false
			})
		})
		yield val
	}
}

// Insure promises issued after the first failure also terminate
function *flydToAsyncGeneratorTerminating(){
	var self= this|| arguments[0]|| (function(){ throw new Exception() })(),
	  ok= true,
	  prev
	while(ok){
		var val= new Promise(function(resolve, reject){
			if(prev){
				prev.catch(function(err){
					reject(err)
				})
			}
			flyd.stream([self], function(){
				resolve(self())
			})
			flyd.stream([self.end], function(){
				reject(self.end())
				ok= false
			})
		})

		prev= val
		yield val
	}
}
