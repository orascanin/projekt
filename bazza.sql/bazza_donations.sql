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
-- Table structure for table `donations`
--

DROP TABLE IF EXISTS `donations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `donations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `donor_id` int DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `donation_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `transaction_id` varchar(255) DEFAULT NULL,
  `payment_status` enum('pending','completed','failed') DEFAULT 'pending',
  PRIMARY KEY (`id`),
  KEY `donor_id` (`donor_id`),
  CONSTRAINT `donations_ibfk_1` FOREIGN KEY (`donor_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `donations`
--

LOCK TABLES `donations` WRITE;
/*!40000 ALTER TABLE `donations` DISABLE KEYS */;
INSERT INTO `donations` VALUES (1,2,40.00,'2024-09-17 09:38:25','pi_3PzxrYCfu7fp2kt4020OXFej','completed'),(2,2,68.00,'2024-09-17 09:38:56','pi_3Pzxs3Cfu7fp2kt40qp4LfW9','completed'),(3,2,150.00,'2024-09-17 09:39:21','pi_3PzxsSCfu7fp2kt41mCvskLv','completed'),(4,2,10.00,'2024-09-17 09:39:50','pi_3PzxsvCfu7fp2kt40TFspiyT','completed'),(5,2,5.00,'2024-09-17 09:40:22','pi_3PzxtSCfu7fp2kt41NRkKANC','failed'),(6,3,80.00,'2024-09-17 09:48:56','pi_3Pzy1jCfu7fp2kt40zH41o6h','completed'),(7,3,63.00,'2024-09-17 09:49:17','pi_3Pzy25Cfu7fp2kt41Gu4UWJL','completed'),(8,3,16.00,'2024-09-17 09:49:47','pi_3Pzy2YCfu7fp2kt41ltniRYj','failed'),(9,67,44.00,'2024-09-17 09:51:41','pi_3Pzy4OCfu7fp2kt40IpcMrej','completed'),(10,67,93.00,'2024-09-17 09:52:08','pi_3Pzy4pCfu7fp2kt40h2KRQ7G','completed'),(11,67,33.00,'2024-09-17 09:52:31','pi_3Pzy5CCfu7fp2kt40X7Hyplv','completed'),(12,67,11.00,'2024-09-17 09:53:01','pi_3Pzy5gCfu7fp2kt41IX4E46X','failed'),(13,67,13.00,'2024-09-17 09:53:37','pi_3Pzy6GCfu7fp2kt410tVO1Od','failed'),(14,67,97.00,'2024-09-17 09:54:02','pi_3Pzy6fCfu7fp2kt40qxztzO8','completed'),(15,67,55.00,'2024-09-17 10:18:00','pi_3PzyTrCfu7fp2kt41BuYwplB','completed'),(16,67,11.00,'2024-09-17 10:18:33','pi_3PzyUOCfu7fp2kt40LxNCZoF','failed'),(17,3,47.00,'2024-09-17 10:24:55','pi_3PzyaYCfu7fp2kt40KHOaOVP','completed'),(18,3,6.00,'2024-09-17 10:26:05','pi_3PzybgCfu7fp2kt40qu3p3WE','failed'),(19,2,65.00,'2024-09-17 10:29:18','pi_3PzyeoCfu7fp2kt41Lrl7Slr','completed'),(20,2,88.00,'2024-09-17 10:29:53','pi_3PzyfMCfu7fp2kt415eTRoXz','pending'),(21,67,72.00,'2024-09-19 09:08:16','pi_3Q0gLTCfu7fp2kt410tEiMPM','completed'),(22,67,54.00,'2024-09-19 09:10:27','pi_3Q0gNaCfu7fp2kt41EXmW34m','failed'),(23,72,46.00,'2024-09-20 12:54:24','pi_3Q16LrCfu7fp2kt419bHFJHM','completed'),(24,72,14.00,'2024-09-20 12:55:07','pi_3Q16MZCfu7fp2kt403uO7yTt','failed'),(25,72,75.00,'2024-09-20 12:55:34','pi_3Q16MzCfu7fp2kt40HxdpCGt','completed'),(26,67,11.00,'2024-09-20 14:50:35','pi_3Q18AICfu7fp2kt41QFd3vRq','failed'),(27,67,250.00,'2024-09-20 14:51:01','pi_3Q18AiCfu7fp2kt40QN9qWvp','completed'),(28,2,77.00,'2024-09-20 15:10:57','pi_3Q18U0Cfu7fp2kt402ky5Kgj','completed'),(29,3,280.00,'2024-09-20 15:14:07','pi_3Q18X4Cfu7fp2kt41fES0c00','completed');
/*!40000 ALTER TABLE `donations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-09-20 17:58:18
