-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `games_legend`
--

-- --------------------------------------------------------

--
-- Table structure for table `cart`
--

CREATE TABLE `cart` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Games'),
(3, 'Accessories'),
(4, 'Services'),
(9, 'Gaming Consoles'),
(12, 'Test manage category');

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `order_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `message`, `is_read`, `created_at`, `order_id`) VALUES
(3, 2, 'New order #4 has been placed for $499.00', 1, '2026-04-25 11:57:16', 4),
(4, 2, 'New order #5 has been placed for $59.00', 1, '2026-04-25 12:04:30', 5),
(5, 2, 'New order #6 has been placed for $70.00', 1, '2026-04-26 03:19:16', 6),
(6, 2, 'New order #7 has been placed for $569.00', 1, '2026-04-26 04:02:26', 7);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `buyer_id` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','cancelled') DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `buyer_id`, `total_amount`, `status`, `created_at`) VALUES
(1, 3, 499.00, 'completed', '2026-04-20 03:54:38'),
(2, 3, 59.00, 'completed', '2026-04-25 11:46:07'),
(3, 3, 479.00, 'completed', '2026-04-25 11:50:21'),
(4, 3, 499.00, 'completed', '2026-04-25 11:57:16'),
(5, 3, 59.00, 'completed', '2026-04-25 12:04:30'),
(6, 3, 70.00, 'completed', '2026-04-26 03:19:16'),
(7, 3, 569.00, 'completed', '2026-04-26 04:02:26');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `price_at_purchase` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price_at_purchase`) VALUES
(1, 1, 23, 1, 499.00),
(2, 2, 24, 1, 59.00),
(3, 3, 15, 1, 479.00),
(4, 4, 23, 1, 499.00),
(5, 5, 24, 1, 59.00),
(6, 6, 16, 1, 70.00),
(7, 7, 16, 1, 70.00),
(8, 7, 14, 1, 499.00);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `vendor_id` int(11) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `vendor_id`, `category_id`, `title`, `description`, `price`) VALUES
(14, 7, 9, 'PlayStation 5 Console', 'Latest Sony gaming console with ultra-fast SSD and 4K gaming support', 499.00),
(15, 7, 9, 'Xbox Series X', 'Powerful Microsoft console with high performance and Game Pass support', 479.00),
(16, 7, 1, 'FIFA 26', 'The newest football simulation game with updated teams and realistic gameplay', 70.00),
(17, 7, 3, 'Gaming Headset RGB', 'Comfortable headset with surround sound and RGB lighting for immersive gaming', 39.00),
(18, 7, 3, 'DualSense Wireless Controller', 'Official PlayStation 5 controller with haptic feedback and adaptive triggers', 69.00),
(19, 7, 4, 'Xbox Game Pass Ultimate (1 Month)', 'Subscription giving access to hundreds of Xbox console games online and offline', 15.00),
(20, 8, 9, 'PlayStation 5 Digital Edition', 'All-digital PS5 console without disc drive, supports fast downloads and 4K gaming', 449.00),
(21, 8, 9, 'Xbox Series S', 'Compact next-gen Xbox console designed for digital gaming with smooth performance', 299.00),
(22, 8, 3, 'Nintendo Switch Pro Controller', 'Premium wireless controller for Nintendo Switch with ergonomic design and long battery life', 79.00),
(23, 9, 9, 'PlayStation 5 Slim Console', 'New slimmer version of PS5 with same performance and improved design and efficiency', 499.00),
(24, 9, 3, 'Xbox Wireless Controller – Carbon Black', 'Official Xbox controller with textured grip, Bluetooth support, and improved latency', 59.00),
(25, 9, 3, 'Nintendo Switch Joy-Con Pair', 'Original detachable controllers for Nintendo Switch with motion control and multiplayer support\n', 79.00);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('buyer','vendor','admin') DEFAULT 'buyer',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `password`, `role`, `created_at`) VALUES
(1, 'Youssef', 'youssef@example.com', '$2b$12$7Cawpy4HqjT3khzkhdlTluQ6OvzhlZxzEViQxEyRCmV07CIoQwnQy', 'buyer', '2026-04-18 23:54:21'),
(2, 'Admin', 'admin@gmail.com', '$2b$12$hKBPR51WQJuDjQkQW88m7O4BRRFs6o27ntLrYS3bJKImXnhouN8sW', 'admin', '2026-04-19 00:00:33'),
(3, 'Omar', 'omar@example.com', '$2b$12$6Uw9Z3AvitHIlGeco9y/rOtuP2jU5/49RwRV0SjSDYmWkQWPrH3lW', 'buyer', '2026-04-19 00:27:47'),
(5, 'Test', 'test@example.com', '$2b$12$YzrORQr6k9NALdEy3Ydwf.QWaZXTfeua3.m9Jg9csfBSNNNw39f1e', 'buyer', '2026-04-19 01:02:33'),
(7, 'Vendor', 'vendor@gmail.com', '$2b$12$Bw.T8bmego3xcojOJ4vBduZomSwMRGXdLH9HIDgmVpQuwfKIFJ67i', 'vendor', '2026-04-19 01:25:46'),
(8, 'Game Valley', 'gamevalley@gmail.com', '$2b$12$A3ibP5zciGdRTCpMD68IEefPvTRVUf1tTwdYQF1.I4xLJ4kH1V73K', 'vendor', '2026-04-19 03:36:12'),
(9, 'Games Spot', 'games_spot@gmail.com', '$2b$12$Cl/41y0Dk4T/GsZOaGecHuOv0wBnkq1IMQ2/OSd.6TySBqfhoXKeS', 'vendor', '2026-04-19 03:37:50'),
(11, 'Games Store', 'games_store@gmail.com', '$2b$12$NE5iMUzbOJh5qrLdGmw7zegd71bjLolYxXMb4uONx3kYnGpPOM4Fa', 'vendor', '2026-04-26 06:10:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cart`
--
ALTER TABLE `cart`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `buyer_id` (`buyer_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `vendor_id` (`vendor_id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `cart`
--
ALTER TABLE `cart`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart`
--
ALTER TABLE `cart`
  ADD CONSTRAINT `cart_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`vendor_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
