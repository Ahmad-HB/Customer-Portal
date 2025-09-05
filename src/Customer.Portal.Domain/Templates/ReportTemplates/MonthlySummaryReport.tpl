<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Monthly Summary Report</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            line-height: 1.6; 
            color: #333; 
            margin: 0; 
            padding: 0; 
            background-color: #f8f9fa;
        }
        .container { 
            max-width: 800px; 
            margin: 0 auto; 
            background-color: white; 
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header { 
            background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%); 
            color: white; 
            padding: 30px; 
            text-align: center;
        }
        .header h1 { 
            margin: 0; 
            font-size: 28px; 
            font-weight: 300;
        }
        .header .subtitle { 
            margin-top: 10px; 
            opacity: 0.9; 
            font-size: 16px;
        }
        .content { 
            padding: 30px;
        }
        .info-section { 
            background-color: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            margin-bottom: 25px;
            border-left: 4px solid #fd7e14;
        }
        .info-grid { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
            margin-top: 15px;
        }
        .info-item { 
            background-color: white; 
            padding: 15px; 
            border-radius: 6px; 
            border: 1px solid #e9ecef;
        }
        .info-item strong { 
            color: #fd7e14; 
            display: block; 
            margin-bottom: 5px;
        }
        .metric-card {
            background: linear-gradient(135deg, #fd7e14 0%, #ff6b35 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 20px;
        }
        .metric-value {
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .metric-label {
            font-size: 14px;
            opacity: 0.9;
        }
        .footer { 
            background-color: #6c757d; 
            color: white; 
            padding: 20px; 
            text-align: center; 
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Monthly Summary Report</h1>
            <div class="subtitle">Executive Dashboard</div>
        </div>
        
        <div class="content">
            <div class="info-section">
                <h2>Report Period</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Start Date</strong>
                        {{ start_date }}
                    </div>
                    <div class="info-item">
                        <strong>End Date</strong>
                        {{ end_date }}
                    </div>
                </div>
            </div>

            <div class="metric-card">
                <div class="metric-value">{{ total_tickets }}</div>
                <div class="metric-label">Total Tickets</div>
            </div>

            <div class="info-section">
                <h2>Ticket Statistics</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Resolved Tickets</strong>
                        {{ resolved_tickets }}
                    </div>
                    <div class="info-item">
                        <strong>In Progress</strong>
                        {{ in_progress_tickets }}
                    </div>
                    <div class="info-item">
                        <strong>Closed Tickets</strong>
                        {{ closed_tickets }}
                    </div>
                    <div class="info-item">
                        <strong>Resolution Rate</strong>
                        {{ resolved_tickets / total_tickets * 100 | math.round 2 }}%
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h2>Performance Metrics</h2>
                <p>This report provides a comprehensive overview of support ticket activities for the specified period. 
                The data shows the distribution of tickets across different statuses and provides insights into 
                the overall performance of the support team.</p>
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Customer Portal. All rights reserved.</p>
            <p>Generated on {{ date.now }}</p>
        </div>
    </div>
</body>
</html>
