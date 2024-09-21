-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: localhost    Database: bazza
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `gender` char(6) DEFAULT NULL,
  `phone_number` varchar(20) NOT NULL,
  `country` varchar(50) NOT NULL,
  `city` varchar(50) NOT NULL,
  `address` varchar(255) NOT NULL,
  `postal_code` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','director','caregiver','donor') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'Faris','Veladžić','faris.veladzic@gmail.com','male','1235567890','BiH','Bužim','123 Ulica','12335','scrypt:32768:8:1$rcriNpIiFAIq8OKO$fc64bb07264ddf7b298ce4b370749424458e5850e8dba2921c053e75afb1fc6055cd2763debac3b2847ee74bbcf07cf117e8cf8e0fba764ffc2a730f6e62215f','admin','2024-09-17 07:35:32'),(2,'Daria','Jusic','daria.jusic@gmail.com','male','1235557890','BiH','Bužim','133 Ulica','12335','scrypt:32768:8:1$FHeE5wbNVNOwFwzT$8a9a9c84a55740feaa8e64a430641d58132182b9302a709a140979f14251d58dc9b7635f3ea64fe7b5c5e16d58afde2e1c6e653959573630068cce589866c846','director','2024-09-17 07:35:32'),(3,'Nejla','Latić','nejla.latic@gmail.com','female','1235557899','BiH','Bužim','133 Ulica','13335','scrypt:32768:8:1$yZASMadJnB0iHLxB$cf671d532eceff8795c9f57343a7e2484e5a8be937539a4d939ea73958999356cc8eb63574dc6fc08b5ed65fe4c1677c68ca616fdf160de5d500c8e16f09f5f9','caregiver','2024-09-17 07:35:32'),(6,'John','Mašinović','ef12c924c4@gmail.com','male','0006491','BiH','Bihać','575 Elm Street','96390','3ab3b1d3a9','caregiver','2024-09-17 07:36:36'),(7,'John','Balkić','9fc268aeba@gmail.com','male','0002960','BiH','Velika Kladuša','351 Elm Street','21490','dd7c4c8ef0','director','2024-09-17 07:36:36'),(8,'John','Brown','3589192047@gmail.com','female','0006994','BiH','Bosanska Krupa','453 Elm Street','73620','c2bf65ca41','director','2024-09-17 07:36:36'),(9,'Johnn','Jones','db0db37c87@gmail.com','other','0004308','BiH','Cazin','34 Elm Street','77500','d7b8c9defd','caregiver','2024-09-17 07:36:36'),(10,'John','Williams','cf3cf4bf61@gmail.com','male','0001206','BiH','Velika Kladuša','941 Elm Street','12550','d1c8ace184','caregiver','2024-09-17 07:36:36'),(11,'John','Johnson','b644054c3f@gmail.com','male','0007236','BiH','Bosanska Krupa','667 Elm Street','63410','0364755e59','donor','2024-09-17 07:36:36'),(12,'John','Smith','67c51fc4ee@gmail.com','male','0001977','BiH','Bosanska Krupa','997 Elm Street','43350','c7ef939191','caregiver','2024-09-17 07:36:36'),(13,'Jane','Jusić','654efc3f26@gmail.com','male','000486','BiH','Mostar','787 Elm Street','37570','237b65623a','director','2024-09-17 07:36:36'),(14,'Jane','Husić','b859ceaebf@gmail.com','female','0005394','BiH','Banja Luka','525 Elm Street','73970','3f1e1b39bc','director','2024-09-17 07:36:36'),(15,'Jane','Mašinović','9830a05377@gmail.com','other','0005696','BiH','Tuzla','291 Elm Street','85620','00900177b7','director','2024-09-17 07:36:36'),(16,'Jane','Balkić','f9f2036504@gmail.com','male','0006386','BiH','Bosanska Krupa','41 Elm Street','43520','a90db090d5','donor','2024-09-17 07:36:36'),(17,'Jane','Brown','4d33b4d834@gmail.com','male','0004301','BiH','Sarajevo','19 Elm Street','91260','5570cb4513','donor','2024-09-17 07:36:36'),(18,'Jane','Jones','0224472d5a@gmail.com','female','0009369','BiH','Velika Kladuša','263 Elm Street','87130','a6bbfdb112','admin','2024-09-17 07:36:36'),(19,'Jane','Williams','7c5dc64973@gmail.com','female','0007375','BiH','Bosanska Krupa','298 Elm Street','98440','c3e6602207','admin','2024-09-17 07:36:36'),(20,'Jane','Johnson','03ab9ecf18@gmail.com','female','0007570','BiH','Velika Kladuša','801 Elm Street','56260','cf7248f276','director','2024-09-17 07:36:36'),(21,'Jane','Smith','0349ee0fbe@gmail.com','other','0001752','BiH','Bosanska Krupa','184 Elm Street','29550','efd8fc8379','caregiver','2024-09-17 07:36:36'),(22,'Michael','Jusić','40b8f9c62d@gmail.com','female','000911','BiH','Cazin','481 Elm Street','35320','783b879f38','caregiver','2024-09-17 07:36:36'),(23,'Michael','Husić','2ec353a1b2@gmail.com','female','0002899','BiH','Cazin','312 Elm Street','25280','21d873389d','donor','2024-09-17 07:36:36'),(24,'Michael','Mašinović','c8b2c57daa@gmail.com','female','0005983','BiH','Bužim','798 Elm Street','23420','3a8cb3b130','admin','2024-09-17 07:36:36'),(25,'Michael','Balkić','55c8526a72@gmail.com','female','000509','BiH','Mostar','737 Elm Street','15120','7e2d9518a7','director','2024-09-17 07:36:36'),(26,'Michael','Brown','834bd9a352@gmail.com','other','0008719','BiH','Bužim','39 Elm Street','40500','7d5bb52223','director','2024-09-17 07:36:36'),(27,'Michael','Jones','776772bb7f@gmail.com','female','0002894','BiH','Bihać','707 Elm Street','59300','f77cbfc960','director','2024-09-17 07:36:36'),(28,'Michael','Williams','ac7d8f216b@gmail.com','other','0003761','BiH','Bihać','484 Elm Street','45310','5af934c28b','caregiver','2024-09-17 07:36:36'),(29,'Michael','Johnson','5c0ab3eb70@gmail.com','female','0005152','BiH','Cazin','920 Elm Street','12190','9817de6185','donor','2024-09-17 07:36:36'),(30,'Michael','Smith','bb35c7ad79@gmail.com','female','0004389','BiH','Cazin','724 Elm Street','39680','c984d3dd6c','donor','2024-09-17 07:36:36'),(31,'Emily','Jusić','291f9dfd49@gmail.com','other','0006523','BiH','Banja Luka','364 Elm Street','82840','35898c0b93','donor','2024-09-17 07:36:36'),(32,'Emily','Husić','54a5e3c396@gmail.com','male','0001585','BiH','Zenica','41 Elm Street','9740','31e4f08b61','caregiver','2024-09-17 07:36:36'),(33,'Emily','Mašinović','4a5d848770@gmail.com','male','0004780','BiH','Bihać','469 Elm Street','20600','40b77cd5c3','director','2024-09-17 07:36:36'),(34,'Emily','Balkić','f927b1bc20@gmail.com','female','0003239','BiH','Bihać','985 Elm Street','75180','2fa613f4ed','donor','2024-09-17 07:36:36'),(35,'Emily','Brown','f8dfd22d80@gmail.com','other','0004466','BiH','Sarajevo','848 Elm Street','13020','212ecbf83f','admin','2024-09-17 07:36:36'),(36,'Emily','Jones','c770ffdb53@gmail.com','female','0009239','BiH','Cazin','299 Elm Street','25500','bdbda3e31a','admin','2024-09-17 07:36:36'),(37,'Emily','Williams','fbfe32d52d@gmail.com','other','0003352','BiH','Velika Kladuša','236 Elm Street','63590','ef8a7bc64e','director','2024-09-17 07:36:36'),(38,'Emily','Johnson','43898d53be@gmail.com','other','0004777','BiH','Sarajevo','630 Elm Street','11580','b7bbb9bbdc','admin','2024-09-17 07:36:36'),(39,'Emily','Smith','5ea163f735@gmail.com','female','0008977','BiH','Banja Luka','703 Elm Street','47960','b49a3a8564','donor','2024-09-17 07:36:36'),(40,'Daniel','Jusić','2ccd9e304d@gmail.com','other','0009428','BiH','Zenica','714 Elm Street','44840','9991cd4896','admin','2024-09-17 07:36:36'),(42,'Daniel','Mašinović','3f3038c160@gmail.com','other','0001696','BiH','Cazin','622 Elm Street','83390','181de0f009','admin','2024-09-17 07:36:36'),(43,'Daniel','Balkić','8a182ac74b@gmail.com','female','0009128','BiH','Bosanska Krupa','97 Elm Street','78620','316e5fb691','donor','2024-09-17 07:36:36'),(44,'Daniel','Brown','351e4eb647@gmail.com','other','00026','BiH','Zenica','800 Elm Street','71870','a2d5738e49','donor','2024-09-17 07:36:36'),(45,'Daniel','Jones','abc09be3dc@gmail.com','other','0004192','BiH','Velika Kladuša','109 Elm Street','92760','0f9e2df5d9','donor','2024-09-17 07:36:36'),(46,'Daniel','Williams','a2ac9a6150@gmail.com','male','0001170','BiH','Mostar','218 Elm Street','74910','f0988d470e','admin','2024-09-17 07:36:36'),(47,'Daniel','Johnson','cf1d61f47c@gmail.com','male','0008108','BiH','Bihać','476 Elm Street','23550','b862a0c4a2','admin','2024-09-17 07:36:36'),(48,'Daniel','Smith','3d209d6920@gmail.com','female','0002499','BiH','Bihać','227 Elm Street','95080','69f0bb123d','caregiver','2024-09-17 07:36:36'),(49,'Sara','Jusić','cf232cb413@gmail.com','male','0004542','BiH','Sarajevo','739 Elm Street','63800','d2cb946414','donor','2024-09-17 07:36:36'),(50,'Sara','Husić','7793adc3b6@gmail.com','male','0001415','BiH','Cazin','641 Elm Street','96940','fc2374785e','caregiver','2024-09-17 07:36:36'),(51,'Sara','Mašinović','f146586fe5@gmail.com','female','0006053','BiH','Bihać','918 Elm Street','55150','e5e688807d','director','2024-09-17 07:36:36'),(52,'Sara','Balkić','96825ac77b@gmail.com','other','0007279','BiH','Tuzla','844 Elm Street','60660','6314a656cb','caregiver','2024-09-17 07:36:36'),(53,'Sara','Brown','29466fac2f@gmail.com','female','0002598','BiH','Mostar','1 Elm Street','53820','7be074256d','donor','2024-09-17 07:36:36'),(67,'Fatima','Oraščanin','fatima3.orascanin@gmail.com','female','0603459255','Bosna i Hercegovina','Bosanska Krupa','Jezerski-Oraščani bb','77241','scrypt:32768:8:1$rlXQkf6n2RVJGzfq$1f25ad21a1e8a368f9a2ac91e914a80c5dc91695bcd96e51395fe757d097499dfa9bb9f247c01b1cf1663b2017170576230af3e9294b2026a84fae9e0bb77447','donor','2024-09-17 09:50:48'),(69,'Sajra','Šarić','sajra@gmail.com','female','060000000','BiH','Bihać','Adresa bb','77244','scrypt:32768:8:1$7sAtDczPHz7e6YkJ$6199a21e4afaf1447f0c28d1514d451b2d795cedc13068dfb279984c9389d8cb7fa2f2b033916732c85ba213cc03e3500eed57dc4e96019b6fc3e859671c5702','caregiver','2024-09-17 10:28:52'),(70,'Testni','Korisnik','test123@gmail.com','male','060111111','BiH','Cazin','Cazin bb','77000','scrypt:32768:8:1$YBEOAptoH1UKvHEI$955110e5dfe91b525b5c3d74c149245816b8a849680d7ed12aa33b98ec13a8617974dcb301c55294c5824924cac6cbc2ab1ce2a3d5e5c3e016ecc836f7b9fc7e','director','2024-09-19 09:04:40'),(71,'Sara','Hodžić','sara.hodzic@gmail.com','female','060000000','BiH','Cazin','Adresa bb','777240','scrypt:32768:8:1$L1L4IUAYgHxbtmOi$183303390ffb36083234e4ee6594eea6add7b6d2b8ecf91564c40635da708adf37943730091a03cb509d788ba317e2d4ea8fcc28af8d7550125acff9137f15a2','donor','2024-09-20 12:46:48'),(72,'Ajna','Hodžić','ajna.hodzic@gmail.com','female','060111111','BiH','Cazin','Adresa 72','77244','scrypt:32768:8:1$hJDgN2C4nm9D0Onw$b3726a54682f301f3c2f1e6f5b5a9f64694870f5ffdca28adac1eb5726a53d9512aec40ed6bbac7e363f3edd9924eea1ee46af334237ddc5f31e1940ce8b7eb3','donor','2024-09-20 12:52:56'),(73,'Armin','Hadžipašić','armin.hadzipasic@gmail.com','male','060333111','BiH','Bosanska Krupa','Adresa bb','77240','scrypt:32768:8:1$n1YAnY19AxKEshTC$a98cd76f6a521cde27072b5701eac6bd7eee440c24a487d2405755dee68af44937ca47ed719f17b74f6718fa9d9fd19277815aa29466090311fb97d7db62ab21','donor','2024-09-20 15:03:44'),(74,'Lejla','Latić','lejla.latic@gmail.com','female','063123111','BiH','Cazin','Adresa bb','77222','scrypt:32768:8:1$57h7uSR6CS67TZtZ$c84fa1a24d1ab4d79e25434945db6c4500400904c25183804ba43ce7d0d5c8eaa2e49be9fb55fbb7139c7dfdc5b6d5e19b232e2758e651364bfc6cdcd287137a','caregiver','2024-09-20 15:09:45');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-20 17:58:17
