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
-- Table structure for table `news`
--

DROP TABLE IF EXISTS `news`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `news` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `uploaded_by` int DEFAULT NULL,
  `upload_date` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `news_ibfk_1` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `news`
--

LOCK TABLES `news` WRITE;
/*!40000 ALTER TABLE `news` DISABLE KEYS */;
INSERT INTO `news` VALUES (1,'Podrška mladoj osobi koja izlazi iz sistema alternativne brige ','U proteklom periodu radili smo kontinuirano na rješavanju dugoročnijeg zbrinjavanja mladih koji napuštaju sistem alternativne brige. Zajedničkom podrškom i saradnjom nadležnih Službi socijalne zaštite opština Stari Grad i Novi Grad, kao i Servisa za podršku porodicama i djeci ispred KJU „Dom za djecu bez roditeljskog staranja“ i Fondacije „Second“ riješeno je stambeno pitanje djevojke koja je u procesu osamostaljivanja. U narednom periodu uz pomoć Fondacije Second koja ima potpisan Protokol o saradnji sa KJU „Dom za djecu bez roditeljskog staranja“, radilo se  se na uređenju stambene jedinice koja je ugovorom o zakupu prema najnižoj cijeni data na korištenje.','uploads/pexels-fotios-photos-1369476.jpg',1,'2024-09-17 07:59:46'),(2,'Divno proveden dan u vrtiću Montesori','Kolektiv Doma imao je priliku da posjeti vrtić \"Montesori\" koji pohađaju naši mališani. Tokom posjete imali smo priliku da se upoznamo sa načinom rada i aktivnostima koje se provode kroz programski sadržaj. Oni su zaista naša velika podrška u radu sa djecom.\r\n\r\n ','uploads/pexels-goumbik-296301.jpg',1,'2024-09-17 08:53:48'),(3,'Prvomajski praznici 1','Fondacija \"Second\"  organizovala je i ovo lijepo druženje za našu djecu u prelijepom prirodnom okruženju smještenom na kraju idiličnog bjelašničkog sela Dejčići .Izlet za pamćenje, složit će se mnogi, i još jedna prilika za djecu da se približe prirodi, da uživaju u njenim ljepotama te da provedu dan u radosti i smijehu zajedno sa svojim odgajateljima. Uprkos najavljenom lošem vremenu, skoro 70 djece sa svojim odgajateljima provelo je nezaboravan izlet u prirodi, uživajući do kasnih poslijepodnevnih sati.Jedni su igrali fudbala, drugi odbojke, a treći su skakali na trampolini. Svi su bili oduševljeni ponijima, zečevima i drugim životinjama koje žive na ovom imanju kao i mnogobrojnim drugim sadržajima koji su prilagođeni djeci.','uploads/pexels-roxanne-minnish-2936023-8135971.jpg',1,'2024-09-17 08:57:21'),(4,'Školsko zvono danas će oglasiti početak nove školske godine','Sretno školaraci! \r\nDanas se đaci vraćaju u svoje školske klupe, spremni za nova znanja, prijateljstva i vještine! Želimo im sreću u novoj školskoj godini uz poruku da je znanje jedino bogatsvo koje nam niko ne može oduzeti.\r\nDanas smo posebno ponosni radi naših đaka prvaka, koji uzbuđeno dočekuju novu poglavlje života. Prvačići naši, budite primjer dobrote, uživajte u školskim danima, sklapajte prijateljstva i učite za živote, a ne za ocjenu. Mi ćemo uvijek biti tu za vas!\r\n\r\n Od kolijevke pa do groba, najljepše je đačko doba!','uploads/pexels-roxanne-minnish-2936023-8135971.jpg',1,'2024-09-17 08:59:35');
/*!40000 ALTER TABLE `news` ENABLE KEYS */;
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
