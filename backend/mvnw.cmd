@echo off
SET JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
SET PATH=%JAVA_HOME%\bin;C:\apache-maven-3.6.0\bin;%PATH%
C:\apache-maven-3.6.0\bin\mvn.cmd %*
