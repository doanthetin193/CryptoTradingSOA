@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script, version 3.2.0
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET "BASE_DIR=%~dp0")

@SET MAVEN_PROJECTBASEDIR=%BASE_DIR%
@IF NOT "%MAVEN_BASEDIR%"=="" @SET MAVEN_PROJECTBASEDIR=%MAVEN_BASEDIR%

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain

@SET DOWNLOAD_URL="https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar"

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%\.mvn\wrapper\maven-wrapper.properties") DO (
    @IF "%%A"=="wrapperUrl" @SET DOWNLOAD_URL=%%B
)

@SET M2_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin\3311e1d4\apache-maven-3.9.6
@IF EXIST "%M2_HOME%\bin\mvn.cmd" (
    @SET "MAVEN_CMD=%M2_HOME%\bin\mvn.cmd"
    @GOTO execute
)

@SETLOCAL
@SET JAVA_HOME_CMD=java
@FOR /F "tokens=*" %%i IN ('where java 2^>NUL') DO @SET JAVA_HOME_CMD=%%i

@ECHO Downloading Maven wrapper...
"%JAVA_HOME_CMD%" -jar "" 2>NUL || (
    @ECHO Downloading Maven Wrapper jar...
    powershell -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%WRAPPER_JAR%'" 2>NUL
    if ERRORLEVEL 1 (
        curl -fsSL "%DOWNLOAD_URL%" -o "%WRAPPER_JAR%"
    )
)
@ENDLOCAL

:execute
@SET MAVEN_OPTS=%MAVEN_OPTS% -Xss10m
@IF EXIST "%MAVEN_CMD%" (
    @"%MAVEN_CMD%" %*
) ELSE (
    @java -cp "%WRAPPER_JAR%" %WRAPPER_LAUNCHER% %*
)
