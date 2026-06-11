@echo off
SET JAVA_HOME=C:\Program Files\Java\jdk-21.0.10
SET PATH=%JAVA_HOME%\bin;C:\apache-maven-3.6.0\bin;%PATH%

echo Starting ConstructX Backend...
echo Java: %JAVA_HOME%
echo Maven: C:\apache-maven-3.6.0

mvn spring-boot:run
