mysql> use betafinal;
Database changed
mysql> describe users;
+----------+-------------+------+-----+---------+----------------+
| Field    | Type        | Null | Key | Default | Extra          |
+----------+-------------+------+-----+---------+----------------+
| id       | int         | NO   | PRI | NULL    | auto_increment |
| nombre   | varchar(30) | NO   |     | NULL    |                |
| email    | varchar(30) | NO   |     | NULL    |                |
| username | varchar(20) | NO   |     | NULL    |                |
| password | varchar(80) | NO   |     | NULL    |                |
| ingreso  | timestamp   | NO   |     | NULL    |                |
| licencia | int         | NO   |     | NULL    |                |
| saldo    | float       | YES  |     | 0       |                |
| DNI      | int         | NO   |     | NULL    |                |
+----------+-------------+------+-----+---------+----------------+
9 rows in set (0.12 sec)

mysql> select * from users;
+----+------------------+-------------------------------+---------------+--------------------------------------------------------------+---------------------+----------+-------+----------+
| id | nombre           | email                         | username      | password                                                     | ingreso             | licencia | saldo | DNI      |
+----+------------------+-------------------------------+---------------+--------------------------------------------------------------+---------------------+----------+-------+----------+
| 29 | Mara Montenegro  | maramariamontenegro@gmail.com | Mara_Maria    | $2a$10$6XOjaxmI/UMS2oxcnk0oc.GWcnZURoK4X0DvNNxJxCr3c.1h3SYaq | 1999-12-31 23:59:59 |        1 |   890 | 47287547 |
| 30 | Agustín Gurvich  | agus.gurvich@gmail.com        | agus_gurvich  | $2a$10$SdFKk7/M7B/WBjRSDVGLQu.9JTAjTuXP123b26b3evJxEjeg1aMUG | 1999-12-31 23:59:59 |        1 |  2530 | 45949135 |
| 31 | Matías Gurvich   | matiasgurvich@gmail.com       | mati_gurvich  | $2a$10$t/NABHrgax6iHgJWcyIBqeOmMXvoPGMR7CXz6Zssr7Dy5yZEJANDq | 1999-12-31 23:59:59 |        1 |     0 | 11111111 |
| 32 | Diego Gurvich    | digurvich@gmail.com           | digurvich     | $2a$10$ifb6wSD5DhsgiDiTQsSRpudMgweRCoDNY2uY9ZMX9vkDzhwppNujW | 1999-12-31 23:59:59 |        1 | 12105 | 22222222 |
| 33 | lineadetiempo    | lineadetiempo@gmail.com       | lineadetiempo | $2a$10$vI7Dk/65G8SbDDIol/Kj5ebrpKVjC/XPXKnFM6p99Umv/29Gm6iv6 | 1999-12-31 23:59:59 |        3 |     0 |        0 |
| 34 | Fotocopiadora    | fdelosestudiantes@gmail.com   | Fotocopiadora | $2a$10$p0VyML/hBExVlS2ZJALAEOjg6.jYU9O9jeJBuEj93bhAFDUjUSVbC | 1999-12-31 23:59:59 |        2 |     0 | 99999999 |
| 35 | agustin          | agus.gurvich@gmail.com        | agusss        | $2a$10$O1gDyS9vNtE5yyKgwUDjUOFrUm3ERqDpqi4R5EFeyvp8RA/6eV2z6 | 2024-03-05 13:52:42 |        1 |     0 | 45949135 |
| 36 | bANANA           | BANANA@GMAIL.COM              | BANANA        | $2a$10$NFWsMj85G/Kon8MFxhNI5.n7mt98RoPZylxO.kPTQnSDIyHguLiwm | 2024-03-05 13:54:06 |        1 |     0 | 45949135 |
+----+------------------+-------------------------------+---------------+--------------------------------------------------------------+---------------------+----------+-------+----------+
8 rows in set (0.03 sec)

mysql> describe pedidos;
+----------------+-------------+------+-----+---------------------+----------------+
| Field          | Type        | Null | Key | Default             | Extra          |
+----------------+-------------+------+-----+---------------------+----------------+
| id             | int         | NO   | PRI | NULL                | auto_increment |
| tipo           | varchar(20) | YES  |     | NULL                |                |
| archivo        | blob        | YES  |     | NULL                |                |
| precio         | float       | NO   |     | NULL                |                |
| descripción    | varchar(40) | YES  |     | NULL                |                |
| copias         | varchar(5)  | YES  |     | NULL                |                |
| tipo_impresion | varchar(10) | NO   |     | NULL                |                |
| user_id        | int         | YES  | MUL | NULL                |                |
| nombre         | varchar(50) | YES  |     | NULL                |                |
| nombre_archivo | varchar(50) | YES  |     | NULL                |                |
| tamaño         | int         | YES  |     | NULL                |                |
| estadoPago     | varchar(15) | YES  |     | No abonado          |                |
| estado         | varchar(15) | YES  |     | Pendiente           |                |
| formato        | varchar(10) | YES  |     | A4                  |                |
| fecha          | timestamp   | YES  |     | 1999-12-31 23:59:59 |                |
| link           | text        | YES  |     | NULL                |                |
| anillado       | varchar(15) | YES  |     | Sin Info            |                |
| fotocopiadora  | varchar(10) | NO   |     | NULL                |                |
| ingresado      | float       | YES  |     | 0                   |                |
| color          | tinyint(1)  | YES  |     | 0                   |                |
+----------------+-------------+------+-----+---------------------+----------------+
20 rows in set (0.00 sec)

mysql> describe preciosPorHoja;
ERROR 1146 (42S02): Table 'betafinal.preciosporhoja' doesn't exist
mysql> show tables;
+---------------------+
| Tables_in_betafinal |
+---------------------+
| pedidos             |
| precioporanillado   |
| precioporhoja       |
| prereserva          |
| sessions            |
| users               |
+---------------------+
6 rows in set (0.01 sec)

mysql> describe precioPorHoja;
+--------+-------------+------+-----+---------+----------------+
| Field  | Type        | Null | Key | Default | Extra          |
+--------+-------------+------+-----+---------+----------------+
| id     | int         | NO   | PRI | NULL    | auto_increment |
| precio | float       | NO   |     | NULL    |                |
| hojas  | int         | NO   |     | NULL    |                |
| faz    | varchar(10) | NO   |     | NULL    |                |
| tamaño | varchar(10) | NO   |     | NULL    |                |
+--------+-------------+------+-----+---------+----------------+
5 rows in set (0.00 sec)

mysql> describe precioporanillado;
+--------+-------+------+-----+---------+----------------+
| Field  | Type  | Null | Key | Default | Extra          |
+--------+-------+------+-----+---------+----------------+
| id     | int   | NO   | PRI | NULL    | auto_increment |
| numero | int   | YES  |     | NULL    |                |
| hojas  | int   | NO   |     | NULL    |                |
| precio | float | NO   |     | NULL    |                |
+--------+-------+------+-----+---------+----------------+
4 rows in set (0.00 sec)

mysql> select * from precioporanillado;
+----+--------+-------+--------+
| id | numero | hojas | precio |
+----+--------+-------+--------+
|  1 |      7 |    25 |    900 |
|  2 |      9 |    75 |    900 |
|  3 |     12 |    90 |   1200 |
|  4 |     14 |   125 |   1200 |
|  5 |     17 |   160 |   1200 |
|  6 |     20 |   175 |   1200 |
|  7 |     23 |   190 |   1400 |
|  8 |     25 |   220 |   1400 |
|  9 |     29 |   280 |   1400 |
| 10 |     33 |   300 |   1400 |
| 11 |     40 |   360 |   1600 |
| 12 |     45 |   430 |   1600 |
| 13 |     50 |   500 |   1600 |
| 14 |      0 |     0 |    500 |
+----+--------+-------+--------+
14 rows in set (0.01 sec)

mysql> select * from precioporhoja;
+----+--------+-------+-----------+--------+
| id | precio | hojas | faz       | tamaño |
+----+--------+-------+-----------+--------+
|  2 |     30 |     0 | Simple    | Oficio |
|  3 |     28 |     0 | Simple    | A4     |
|  4 |     26 |    50 | Doble     | A4     |
|  5 |     25 |   100 | Doble     | A4     |
|  6 |     24 |   250 | Doble     | A4     |
|  7 |     22 |   500 | Doble     | A4     |
|  8 |     20 |  1000 | Doble     | A4     |
|  9 |     19 |  1500 | Doble     | A4     |
| 10 |     28 |    50 | Doble     | Oficio |
| 11 |     27 |   100 | Doble     | Oficio |
| 12 |     26 |   250 | Doble     | Oficio |
| 13 |     24 |   500 | Doble     | Oficio |
| 14 |     22 |  1000 | Doble     | Oficio |
| 15 |     21 |  1500 | Doble     | Oficio |
| 16 |     55 |     0 | Doblecol  | Oficio |
| 17 |     63 |     0 | Simplecol | Oficio |
| 18 |     60 |     0 | Simplecol | A4     |
| 19 |     53 |     0 | Doblecol  | A4     |
+----+--------+-------+-----------+--------+
18 rows in set (0.01 sec)

mysql> describe prereserva;
+--------+-------------+------+-----+---------+----------------+
| Field  | Type        | Null | Key | Default | Extra          |
+--------+-------------+------+-----+---------+----------------+
| id     | int         | NO   | PRI | NULL    | auto_increment |
| nombre | varchar(80) | NO   |     | NULL    |                |
| precio | float       | YES  |     | NULL    |                |
| año    | varchar(8)  | NO   |     | Primero |                |
+--------+-------------+------+-----+---------+----------------+
4 rows in set (0.00 sec)

mysql> select * from prereserva;
+----+----------------------------+--------+---------+
| id | nombre                     | precio | año     |
+----+----------------------------+--------+---------+
|  1 | libro uno uno uno uno uno  |    900 | Primero |
|  2 | libro dos dosd dos dosw no |  12200 | Primero |
|  3 | libro tres tres tres trees |  12200 | Primero |
|  4 | libro tres tres tres trees |  12200 | Segundo |
|  5 | libro tres tres tres trees |    200 | Tercero |
|  6 | Bronwlemay                 |  20000 | Quinto  |
+----+----------------------------+--------+---------+
6 rows in set (0.01 sec)
