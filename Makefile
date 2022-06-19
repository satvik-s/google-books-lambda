deploy:
	rm -rf dist*
	rm -rf cdk.out
	npm run build
	cdk synth
	cdk deploy
