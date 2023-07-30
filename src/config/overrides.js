export const resourceNameOverridesByOperationId = {
    discoveryengine: {
        'discoveryengine.projects.locations.collections.dataStores.siteSearchEngine.operations.list' : 'search_engine_operations',
        'discoveryengine.projects.locations.collections.dataStores.siteSearchEngine.targetSites.operations.list' : 'target_site_operations',
    },
    integrations: {
        'integrations.projects.locations.integrations.executeEvent' : 'skip_this_resource',
    },
    osconfig: {
        'osconfig.projects.locations.instances.vulnerabilityReports.get' : 'vulnerability_report',
        'osconfig.projects.locations.instances.osPolicyAssignments.reports.get' : 'report',
    },   
    prod_tt_sasportal: {
        'prod_tt_sasportal.customers.nodes.get' : 'customer_node',
		'prod_tt_sasportal.customers.nodes.list' : 'customer_nodes',
		'prod_tt_sasportal.customers.nodes.nodes.list' : 'customer_nodes',
		'prod_tt_sasportal.customers.nodes.create' : 'customer_nodes',
		'prod_tt_sasportal.customers.nodes.nodes.create' : 'customer_nodes',
		'prod_tt_sasportal.customers.nodes.delete' : 'customer_nodes',
		'prod_tt_sasportal.nodes.get' : 'node',
		'prod_tt_sasportal.nodes.nodes.get' : 'node',	
		'prod_tt_sasportal.nodes.nodes.list' : 'nodes',
		'prod_tt_sasportal.nodes.nodes.nodes.list' : 'nodes',
		'prod_tt_sasportal.nodes.nodes.create' : 'nodes',
		'prod_tt_sasportal.nodes.nodes.nodes.create' : 'nodes',
		'prod_tt_sasportal.nodes.nodes.delete' : 'nodes',		
    },    
    sasportal: {
        'sasportal.customers.nodes.list' : 'customer_nodes',
		'sasportal.customers.nodes.get' : 'customer_nodes',
		'sasportal.customers.nodes.nodes.list' : 'customer_nodes',
		'sasportal.customers.nodes.nodes.create' : 'customer_nodes',
		'sasportal.customers.nodes.create' : 'customer_nodes',
		'sasportal.customers.nodes.delete' : 'customer_nodes',
        'sasportal.customers.nodes.get' : 'customer_node',
		'sasportal.nodes.get' : 'node',
		'sasportal.nodes.nodes.get' : 'node',
		'sasportal.nodes.nodes.nodes.list' : 'nodes',
		'sasportal.nodes.nodes.list' : 'nodes',
		'sasportal.nodes.nodes.nodes.create' : 'nodes',
		'sasportal.nodes.nodes.create' : 'nodes',
		'sasportal.nodes.nodes.delete' : 'nodes',
    },  
    securitycenter: {
        'securitycenter.projects.securityHealthAnalyticsSettings.customModules.list' : 'security_health_analytics_modules',
        'securitycenter.projects.securityHealthAnalyticsSettings.customModules.get' : 'security_health_analytics_modules',
        'securitycenter.organizations.securityHealthAnalyticsSettings.customModules.get' : 'security_health_analytics_modules',
        'securitycenter.folders.securityHealthAnalyticsSettings.customModules.get' : 'security_health_analytics_modules',
        'securitycenter.organizations.securityHealthAnalyticsSettings.customModules.list' : 'security_health_analytics_modules',
        'securitycenter.folders.securityHealthAnalyticsSettings.customModules.list' : 'security_health_analytics_modules',
        'securitycenter.projects.securityHealthAnalyticsSettings.customModules.create' : 'security_health_analytics_modules',
        'securitycenter.organizations.securityHealthAnalyticsSettings.customModules.create' : 'security_health_analytics_modules',
        'securitycenter.folders.securityHealthAnalyticsSettings.customModules.create' : 'security_health_analytics_modules',
        'securitycenter.projects.securityHealthAnalyticsSettings.customModules.delete' : 'security_health_analytics_modules',
        'securitycenter.organizations.securityHealthAnalyticsSettings.customModules.delete' : 'security_health_analytics_modules',
        'securitycenter.folders.securityHealthAnalyticsSettings.customModules.delete' : 'security_health_analytics_modules',
        'securitycenter.projects.eventThreatDetectionSettings.customModules.list' : 'event_threat_detection_modules',
        'securitycenter.organizations.eventThreatDetectionSettings.customModules.list' : 'event_threat_detection_modules',
        'securitycenter.folders.eventThreatDetectionSettings.customModules.list' : 'event_threat_detection_modules',
        'securitycenter.projects.eventThreatDetectionSettings.customModules.create' : 'event_threat_detection_modules',
        'securitycenter.organizations.eventThreatDetectionSettings.customModules.create' : 'event_threat_detection_modules',
        'securitycenter.folders.eventThreatDetectionSettings.customModules.create' : 'event_threat_detection_modules',
		'securitycenter.projects.eventThreatDetectionSettings.customModules.delete' : 'event_threat_detection_modules',
        'securitycenter.organizations.eventThreatDetectionSettings.customModules.delete' : 'event_threat_detection_modules',
        'securitycenter.folders.eventThreatDetectionSettings.customModules.delete' : 'event_threat_detection_modules',
    },    
    servicenetworking: {
        'servicenetworking.services.dnsRecordSets.get' : 'dns_record_set',
    },
    videointelligence: {
        'videointelligence.operations.projects.locations.operations.cancel' : 'long_running_operations',
        'videointelligence.operations.projects.locations.operations.delete' : 'long_running_operations',
        'videointelligence.operations.projects.locations.operations.get' : 'long_running_operations',
    },   
};

export const resourceNameOverridesByResourceName = {
    contactcenteraiplatform: {
        'contact_centers_authentication-config' : 'authentication_config',
    },
    container: {
        'well-known_openid-configuration' : 'well_known_openid_configuration',
    }
};

export const sqlVerbOverrides = {
    cloudbuild: {
        'cloudbuild.projects.locations.gitLabConfigs.removeGitLabConnectedRepository' : 'exec',
        'cloudbuild.projects.locations.bitbucketServerConfigs.removeBitbucketServerConnectedRepository' : 'exec',
    },
    dataform: {
        'dataform.projects.locations.repositories.workspaces.readFile' : 'exec',        
    },
    documentai: {
        'documentai.projects.locations.fetchProcessorTypes' : 'exec',        
    },
};
