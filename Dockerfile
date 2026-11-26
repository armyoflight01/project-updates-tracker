FROM php:8.2-apache

# Install MySQL extensions para sa imong api/db.php
RUN docker-php-ext-install mysqli pdo pdo_mysql

# Enable Apache rewrite
RUN a2enmod rewrite

# Copy tanan project files padulong sa Apache web root
COPY . /var/www/html/

EXPOSE 80