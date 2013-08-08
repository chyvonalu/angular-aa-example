name := "angular-aa-example"

organization := "com.example"

version := "0.1-SNAPSHOT"

scalaVersion := "2.10.2"

seq(webSettings :_*)

libraryDependencies += "net.liftweb" %% "lift-webkit" % "2.5" % "compile"

libraryDependencies += "org.eclipse.jetty" % "jetty-webapp" % "8.1.12.v20130726" % "container"


