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
-- Table structure for table `children`
--

DROP TABLE IF EXISTS `children`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `children` (
  `id` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `date_of_birth` date NOT NULL,
  `date_of_admission` date NOT NULL,
  `caregiver_id` int DEFAULT NULL,
  `jmbg` varchar(13) NOT NULL,
  `place_of_birth` varchar(100) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `parent_name` varchar(100) DEFAULT NULL,
  `notes` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `caregiver_id` (`caregiver_id`),
  CONSTRAINT `children_ibfk_1` FOREIGN KEY (`caregiver_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `children`
--

LOCK TABLES `children` WRITE;
/*!40000 ALTER TABLE `children` DISABLE KEYS */;
INSERT INTO `children` VALUES (1,'Aida','Kolić','2018-05-16','2022-01-11',3,'0204018116053','Cazin','uploads/pexels-alimeddah-2806752.jpg','Azra i Emir Kolić','Nema napomena','2024-09-17 09:12:50'),(4,'Nikola','Novakkk','2021-12-16','2022-01-04',NULL,'1612021116052','Tuzla','uploads/pexels-minan1398-789398.jpg','Nepoznato','Ima napomena','2024-09-17 09:18:38'),(6,'Melisa ','Mešić','2023-11-14','2023-12-21',3,'1411023116053','Cazin','uploads/pexels-pixabay-48148.jpg','Safija i Osman Mešić','Ima napomena','2024-09-17 09:32:39'),(7,'Ksenija','Kovačević','2024-01-02','2024-02-07',3,'0201024116053','Bihać','uploads/pexels-reneterp-2505098.jpg','Nepoznato','Nema napomena','2024-09-17 09:33:26'),(8,'Jovan ','Petrović','2014-06-04','2014-07-16',3,'0406014116051','Cazin','uploads/pexels-minan1398-789398.jpg','Nepoznato','Nema napomena','2024-09-17 09:36:55'),(9,'Mirza','Đorđević','2024-02-07','2024-06-22',3,'0702024116052','Bihać','uploads/pexels-bess-hamiti-83687-35537.jpg','Nepoznato','Nema napomena','2024-09-17 09:37:54');
/*!40000 ALTER TABLE `children` ENABLE KEYS */;
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
