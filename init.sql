CREATE DATABASE IF NOT EXISTS prova_adonis_js;
CREATE USER IF NOT EXISTS 'lucid';
GRANT ALL PRIVILEGES ON *.* TO 'lucid';
ALTER USER 'lucid' IDENTIFIED WITH mysql_native_password BY 'provaadonis';

