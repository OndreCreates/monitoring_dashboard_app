package com.ondrecreates.monitoringdashboard;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class MonitoringDashboardApplication {

    public static void main(String[] args) {
        SpringApplication.run(MonitoringDashboardApplication.class, args);
    }
}
