$(function(){
	const btnSignin = $("#btnSignin");
	const editEmail = $("#inputEmail");
	const editPass = $("#inputPassword");
	btnSignin.click(function(){
		const email = editEmail.val();
		const pass = editPass.val();
		const auth = firebase.auth();

		const promise = auth.signInWithEmailAndPassword(email,pass);
		promise.catch(e => console.log(e.message));
	});

	firebase.auth().onAuthStateChanged(firebaseUser => {
		if(firebaseUser) {
			window.location = "index.html";
		} else {
			console.log('not logged in');
		}
	});
});