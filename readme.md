# How this project rolls

## KISS version
index.js simply opens up the file hosted on the AWS endpoint and retrieves the rows of data in a streaming manner.  This allows the file to be of any reasonable size without memory buffering concerns.  

As the rows are being pulled in, they are converted in situ and written row by row to the destination database, which in this case is MS SQL.

## Composition version
Multi.js is the entry way where the inputs and the outputs are abstracted into simple:
* read
* hasTable
* write

Read simply returns a stream hander to a datasource

HasTable abstracts the creation of a database table or collection and returns true if it is possible to write to the table.  It gets created if needed.

Write takes as its arguments the row and the tableName  so more than one of these ETL operations can run simultaneously.

## If I had more than a few hours
* This would likely get wrapped up into a REST set of endpoints so the whole operation could be triggered and monitored through POST and GET statements.
* I would like to take the credentials and place them into a cloud vault, or at the least put them into environment variables that are set up in the container declaration and invocation code.
* Bulk insert, use some formn of chunking and modifying the write façade to accept either a single row or an array of rows, using the database supplier's builk insert mechanism when arrays are present.
* Include MySQL, Postgres and other knex.js compatible dialects for the query builder within the ORM.   The dialects could be made from a factory function that passes the 'client' value in the initialization
* Invoke a lazy database connection operation so that no resourceses are held by the connection logic until needed.
* Wrap the database functions into a class object to permit more than one instance (though this could present a problem with the connection pool)
* Logging would be nice.  I didn't have the time to set up an ELK instance, but that would be my first choice.   Maybe make a quick dashboard within Kabana, DataDog or whatever Elastic client is chosen so that monitoring is professionalized.
* Add some UPSERT logic to eliminate replication by keying off of the claimNumber allowing only one instance.  This is basically baked in to mongo, and SQL uses a form of MERGE that is outside the ORM's capabilities.
* Based on how much and how the DB is accessed, set-up the appropriate indexes.

## Testing
While this isn't CI/CD grade automated testing, the code does perform a self-test to confirm that the contents of the provided URL are properly translated and stored in the SQL/MySQL/Mongo database.

For this example, I only applied the test to the simple (index.js) version rather than the larger (multi.js) version which simply breaks out the in the stream and the out stream and handles the processing in-between.  Since no real transformation are being performed, nor are any calculations are workflows being initiated, basically this is an integration test.

Good CI/CD would analyze the console output and look for the confirmation phrase "Claim number and employee ID are valid'" and call it a day.

## Deployment
I added the Dockerrun.aws.json file to the root of the project to let Elastic Beanstalk manage the builds and deployment.
Because this particular project is using a built in MySql database (since I'm guessing we want this all self-contained for this exercise)
I'm using version 2 which allows multiple image containers (otherwise v 1 is suitable just for abett app)

To test the application and run it:
 > docker-compose up
 
To build the Docker image and push it to DockrHub or ECR
> npm run build

To create an Elastic Beanstalk application:
You will need to have the AWS CLI installed (plus all of the usual creds)
Also replace --region with the correct location
> eb init -p "Docker" abett --region us-west-2

Create the environment and deploy!
> eb create abett-env

After creating, switch over to deploy
> eb deploy abett-env