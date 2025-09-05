<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Support Agent Report</title>
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
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); 
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
            border-left: 4px solid #007bff;
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
            color: #007bff; 
            display: block; 
            margin-bottom: 5px;
        }
        .status-resolved { color: #28a745; font-weight: bold; }
        .status-pending { color: #ffc107; font-weight: bold; }
        .status-critical { color: #dc3545; font-weight: bold; }
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
            <h1>Support Agent Report</h1>
            <div class="subtitle">Customer Service Summary</div>
        </div>
        
        <div class="content">
            <div class="info-section">
                <h2>Support Agent Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Agent Name</strong>
                        {{ SupportAgentName }}
                    </div>
                    <div class="info-item">
                        <strong>Report Date</strong>
                        {{ date.now }}
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h2>Ticket Details</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Ticket ID</strong>
                        #{{ TicketId }}
                    </div>
                    <div class="info-item">
                        <strong>Status</strong>
                        <span class="status-{{ Status }}">{{ Status }}</span>
                    </div>
                    <div class="info-item">
                        <strong>Customer</strong>
                        {{ CustomerName }}
                    </div>
                    <div class="info-item">
                        <strong>Created Date</strong>
                        {{ CreatedAt }}
                    </div>
                </div>
            </div>

            <div class="info-section">
                <h2>Issue Description</h2>
                <p>{{ IssueDescription }}</p>
            </div>

            {{ if ResolvedAt }}
            <div class="info-section">
                <h2>Resolution Information</h2>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Resolved Date</strong>
                        {{ ResolvedAt }}
                    </div>
                    <div class="info-item">
                        <strong>Resolution Time</strong>
                        Resolved
                    </div>
                </div>
            </div>
            {{ end }}
        </div>
        
        <div class="footer">
            <p>&copy; 2025 Customer Portal. All rights reserved.</p>
            <p>Generated on {{ date.now }}</p>
        </div>
    </div>
</body>
</html>
