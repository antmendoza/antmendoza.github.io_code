package com.antmendoza.temporal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@SpringBootApplication
public class TemporalSpringbootDemoApplication {

	public static void main(String[] args) {
		SpringApplication.run(TemporalSpringbootDemoApplication.class, args).start();
	}

	@Bean
	public WebMvcConfigurer corsConfigurer() {
		return new WebMvcConfigurer() {
			@Override
			public void addCorsMappings(CorsRegistry registry) {

				//Allowing all origins, methods, and headers for the sake of simplicity

				registry.addMapping("/**").allowedOrigins("*").allowedMethods("*").allowedHeaders("*");




			}
		};
	}

}
