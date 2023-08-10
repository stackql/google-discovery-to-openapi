export const resourceNameOverridesByOperationId = {
    compute: {
        'compute.securityPolicies.aggregatedList' : 'security_policies_aggregated',
        'compute.backendServices.aggregatedList' : 'backend_services_aggregated',
        'compute.healthChecks.aggregatedList' : 'health_checks_aggregated',
        'compute.sslCertificates.aggregatedList' : 'ssl_certificates_aggregated',
        'compute.urlMaps.aggregatedList' : 'url_maps_aggregated',
        'compute.targetHttpProxies.aggregatedList' : 'target_http_proxies_aggregated',
        'compute.globalOperations.aggregatedList' : 'global_operations_aggregated',
        'compute.targetHttpsProxies.aggregatedList' : 'target_https_proxies_aggregated',
        'compute.targetTcpProxies.aggregatedList' : 'target_tcp_proxies_aggregated',
        'compute.sslPolicies.aggregatedList' : 'ssl_policies_aggregated', 
        'compute.instanceTemplates.aggregatedList' : 'instance_templates_aggregated',       
    },  
    cloudbuild : {
        'cloudbuild.projects.locations.bitbucketServerConfigs.repos.list' : 'bitbucket_repos',
        'cloudbuild.projects.locations.gitLabConfigs.repos.list' : 'gitlab_repos',
    },
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

export const objectKeyByOperationId = {
    apigateway: {
        'apigateway.projects.locations.apis.list' : '$.apis',
        'apigateway.projects.locations.apis.configs.list' : '$.apiConfigs',
        'apigateway.projects.locations.gateways.list' : '$.gateways',
    },
    baremetalsolution: {
        'baremetalsolution.projects.locations.volumes.luns.list' : '$.luns',
        'baremetalsolution.projects.locations.volumes.snapshots.list' : '$.volumeSnapshots',
        'baremetalsolution.projects.locations.volumes.list' : '$.volumes',
        'baremetalsolution.projects.locations.nfsShares.list' : '$.nfsShares',
        'baremetalsolution.projects.locations.networks.list' : '$.networks',
        'baremetalsolution.projects.locations.instances.list' : '$.instances',
    },
    batch: {
        'batch.projects.locations.jobs.list' : '$.jobs',
        'batch.projects.locations.jobs.taskGroups.tasks.list' : '$.tasks',
    },
    beyondcorp: {
        'beyondcorp.projects.locations.appConnections.list' : '$.appConnections',
        'beyondcorp.projects.locations.appGateways.list' : '$.appGateways',
        'beyondcorp.projects.locations.appConnectors.list' : '$.appConnectors',
    },
    bigtableadmin: {
        'bigtableadmin.projects.instances.clusters.list' : '$.clusters',
        'bigtableadmin.projects.instances.appProfiles.list' : '$.appProfiles',
        'bigtableadmin.projects.instances.list' : '$.instances',
    },
    blockchainnodeengine: {
        'blockchainnodeengine.projects.locations.blockchainNodes.list' : '$.blockchainNodes',
    },
    certificatemanager: {
        'certificatemanager.projects.locations.certificateMaps.certificateMapEntries.list' : '$.certificateMapEntries',
        'certificatemanager.projects.locations.certificateMaps.list' : '$.certificateMaps',
        'certificatemanager.projects.locations.certificateIssuanceConfigs.list' : '$.certificateIssuanceConfigs',
        'certificatemanager.projects.locations.trustConfigs.list' : '$.trustConfigs',
        'certificatemanager.projects.locations.certificates.list' : '$.certificates',
        'certificatemanager.projects.locations.dnsAuthorizations.list' : '$.dnsAuthorizations',
    },
    clouddeploy: {
        'clouddeploy.projects.locations.deliveryPipelines.releases.list' : '$.releases',
        'clouddeploy.projects.locations.deliveryPipelines.releases.rollouts.list' : '$.rollouts',
        'clouddeploy.projects.locations.deliveryPipelines.releases.rollouts.jobRuns.list' : '$.jobRuns',
        'clouddeploy.projects.locations.deliveryPipelines.list' : '$.deliveryPipelines',
        'clouddeploy.projects.locations.targets.list' : '$.targets',
    },
    cloudfunctions: {
        'cloudfunctions.projects.locations.functions.list' : '$.functions',
    },
    connectors: {
        'connectors.projects.locations.connections.entityTypes.list' : '$.types',
        'connectors.projects.locations.connections.actions.list' : '$.actions',
    },
    contactcenteraiplatform: {
        'contactcenteraiplatform.projects.locations.contactCenters.list' : '$.contactCenters',
    },
    dataflow: {
        'dataflow.projects.locations.jobs.messages.list' : '$.jobMessages',
        'dataflow.projects.locations.jobs.list' : '$.jobs',
        'dataflow.projects.jobs.messages.list' : '$.jobMessages',
        'dataflow.projects.jobs.list' : '$.jobs',
    },
    dataform: {
        'dataform.projects.locations.repositories.list' : '$.repositories',
        'dataform.projects.locations.repositories.workflowInvocations.list' : '$.workflowInvocations',
        'dataform.projects.locations.repositories.workspaces.list' : '$.workspaces',
        'dataform.projects.locations.repositories.releaseConfigs.list' : '$.releaseConfigs',
        'dataform.projects.locations.repositories.workflowConfigs.list' : '$.workflowConfigs',
        'dataform.projects.locations.repositories.compilationResults.list' : '$.compilationResults',
    },
    datafusion: {
        'datafusion.projects.locations.instances.list' : '$.instances',
    },
    datamigration: {
        'datamigration.projects.locations.connectionProfiles.list' : '$.connectionProfiles',
        'datamigration.projects.locations.privateConnections.list' : '$.privateConnections',
        'datamigration.projects.locations.migrationJobs.list' : '$.migrationJobs',
        'datamigration.projects.locations.conversionWorkspaces.list' : '$.conversionWorkspaces',
    },
    dataplex: {
        'dataplex.projects.locations.dataAttributeBindings.list' : '$.dataAttributeBindings',
        'dataplex.projects.locations.dataTaxonomies.list' : '$.dataTaxonomies',
        'dataplex.projects.locations.dataTaxonomies.attributes.list' : '$.dataAttributes',
        'dataplex.projects.locations.dataScans.list' : '$.dataScans',
        'dataplex.projects.locations.lakes.list' : '$.lakes',
        'dataplex.projects.locations.lakes.tasks.list' : '$.tasks',
    },
    datastream: {
        'datastream.projects.locations.streams.list' : '$.streams',
        'datastream.projects.locations.privateConnections.routes.list' : '$.routes',
        'datastream.projects.locations.privateConnections.list' : '$.privateConnections',
        'datastream.projects.locations.connectionProfiles.list' : '$.connectionProfiles',
    },
    eventarc: {
        'eventarc.projects.locations.channels.list' : '$.channels',
        'eventarc.projects.locations.channelConnections.list' : '$.channelConnections',
        'eventarc.projects.locations.providers.list' : '$.providers',
        'eventarc.projects.locations.triggers.list' : '$.triggers',
    },
    file: {
        'file.projects.locations.backups.list' : '$.backups',
        'file.projects.locations.instances.list' : '$.instances',
    },
    gkebackup: {
        'gkebackup.projects.locations.backupPlans.list' : '$.backupPlans',
        'gkebackup.projects.locations.restorePlans.restores.list' : '$.restores',
        'gkebackup.projects.locations.restorePlans.list' : '$.restorePlans',
    },
    gkehub: {
        'gkehub.projects.locations.memberships.list' : '$.memberships',
    },
    gkeonprem: {
        'gkeonprem.projects.locations.vmwareAdminClusters.list' : '$.vmwareAdminClusters',
        'gkeonprem.projects.locations.bareMetalClusters.list' : '$.bareMetalClusters',
        'gkeonprem.projects.locations.bareMetalClusters.bareMetalNodePools.list' : '$.bareMetalNodePools',
        'gkeonprem.projects.locations.vmwareClusters.list' : '$.vmwareClusters',
        'gkeonprem.projects.locations.vmwareClusters.vmwareNodePools.list' : '$.vmwareNodePools',
        'gkeonprem.projects.locations.bareMetalAdminClusters.list' : '$.bareMetalAdminClusters',
    },
    ids: {
        'ids.projects.locations.endpoints.list' : '$.endpoints',
    },
    integrations: {
        'integrations.projects.locations.products.integrations.executions.list' : '$.executions',
        'integrations.projects.locations.integrations.executions.list' : '$.executions',
    },
    managedidentities: {
        'managedidentities.projects.locations.global.peerings.list' : '$.peerings',
        'managedidentities.projects.locations.global.domains.list' : '$.domains', 
        'managedidentities.projects.locations.global.domains.sqlIntegrations.list' : '$.sqlIntegrations',
        'managedidentities.projects.locations.global.domains.backups.list' : '$.backups',
    },
    memcache: {
        'memcache.projects.locations.instances.list' : '$.instances',
    },
    metastore: {
        'metastore.projects.locations.federations.list' : '$.federations',
        'metastore.projects.locations.services.list' : '$.services',
        'metastore.projects.locations.services.metadataImports.list' : '$.metadataImports',
        'metastore.projects.locations.services.backups.list' : '$.backups',
    },
    migrationcenter: {
        'migrationcenter.projects.locations.assets.list' : '$.assets',
        'migrationcenter.projects.locations.reportConfigs.list' : '$.reportConfigs',
        'migrationcenter.projects.locations.reportConfigs.reports.list' : '$.reports',
        'migrationcenter.projects.locations.groups.list' : '$.groups',
        'migrationcenter.projects.locations.importJobs.importDataFiles.list' : '$.importDataFiles',
        'migrationcenter.projects.locations.importJobs.list' : '$.importJobs',
        'migrationcenter.projects.locations.sources.errorFrames.list' : '$.errorFrames',
        'migrationcenter.projects.locations.sources.list' : '$.sources',
        'migrationcenter.projects.locations.preferenceSets.list' : '$.preferenceSets',
    },
    monitoring: {
        'monitoring.organizations.timeSeries.list' : '$.timeSeries',
        'monitoring.projects.timeSeries.list' : '$.timeSeries',
        'monitoring.folders.timeSeries.list' : '$.timeSeries',
    },
    networkconnectivity: {
        'networkconnectivity.projects.locations.serviceConnectionTokens.list' : '$.serviceConnectionTokens',
        'networkconnectivity.projects.locations.internalRanges.list' : '$.internalRanges',
        'networkconnectivity.projects.locations.spokes.list' : '$.spokes',
        'networkconnectivity.projects.locations.serviceConnectionMaps.list' : '$.serviceConnectionMaps',
        'networkconnectivity.projects.locations.serviceClasses.list' : '$.serviceClasses',
        'networkconnectivity.projects.locations.global.hubs.routeTables.routes.list' : '$.routes',
        'networkconnectivity.projects.locations.global.hubs.routeTables.list' : '$.routeTables',
        'networkconnectivity.projects.locations.global.hubs.groups.list' : '$.groups',
        'networkconnectivity.projects.locations.global.hubs.list' : '$.hubs',
        'networkconnectivity.projects.locations.serviceConnectionPolicies.list' : '$.serviceConnectionPolicies',
    },
    networkmanagement: {
        'networkmanagement.projects.locations.global.connectivityTests.list' : '$.resources',
    },
    networksecurity: {
        'networksecurity.projects.locations.urlLists.list' : '$.urlLists',
        'networksecurity.projects.locations.gatewaySecurityPolicies.rules.list' : '$.gatewaySecurityPolicyRules',
        'networksecurity.projects.locations.gatewaySecurityPolicies.list' : '$.gatewaySecurityPolicies',
        'networksecurity.projects.locations.tlsInspectionPolicies.list' : '$.tlsInspectionPolicies',
    },
    networkservices: {
        'networkservices.projects.locations.gateways.list' : '$.gateways',
    },
    notebooks: {
        'notebooks.projects.locations.instances.list' : '$.instances',
    },
    privateca: {
        'privateca.projects.locations.certificateTemplates.list' : '$.certificateTemplates',
        'privateca.projects.locations.caPools.certificateAuthorities.list' : '$.certificateAuthorities',
        'privateca.projects.locations.caPools.certificateAuthorities.certificateRevocationLists.list' : '$.certificateRevocationLists',
        'privateca.projects.locations.caPools.certificates.list' : '$.certificates',
        'privateca.projects.locations.caPools.list' : '$.caPools',
    },
    redis: {
        'redis.projects.locations.instances.list' : '$.instances',
    },
    spanner: {
        'spanner.projects.instances.list' : '$.instances',
    },
    sql: {
        'sql.instances.list' : '$.items',
    },
    storage: {
        'storage.objects.list' : '$.prefixes',
    },
    tpu: {
        'tpu.projects.locations.nodes.list' : '$.nodes',
        'tpu.projects.locations.acceleratorTypes.list' : '$.acceleratorTypes',
        'tpu.projects.locations.runtimeVersions.list' : '$.runtimeVersions',
    },
    transcoder: {
        'transcoder.projects.locations.jobs.list' : '$.jobs',
        'transcoder.projects.locations.jobTemplates.list' : '$.jobTemplates',
    },
    vmmigration: {
        'vmmigration.projects.locations.groups.list' : '$.groups',
        'vmmigration.projects.locations.sources.datacenterConnectors.list' : '$.datacenterConnectors',
        'vmmigration.projects.locations.sources.migratingVms.replicationCycles.list' : '$.replicationCycles',
        'vmmigration.projects.locations.sources.migratingVms.cutoverJobs.list' : '$.cutoverJobs',
        'vmmigration.projects.locations.sources.migratingVms.cloneJobs.list' : '$.cloneJobs',
        'vmmigration.projects.locations.sources.migratingVms.list' : '$.migratingVms',
        'vmmigration.projects.locations.sources.utilizationReports.list' : '$.utilizationReports',
        'vmmigration.projects.locations.sources.list' : '$.sources',
        'vmmigration.projects.locations.targetProjects.list' : '$.targetProjects',
    },
    workflows: {
        'workflows.projects.locations.workflows.list' : '$.workflows',
    },
    workloadmanager: {
        'workloadmanager.projects.locations.evaluations.list' : '$.evaluations',
        'workloadmanager.projects.locations.evaluations.executions.list' : '$.executions',
    },
    workstations: {
        'workstations.projects.locations.workstationClusters.list' : '$.workstationClusters',
        'workstations.projects.locations.workstationClusters.workstationConfigs.list' : '$.workstationConfigs',
        'workstations.projects.locations.workstationClusters.workstationConfigs.workstations.list' : '$.workstations',
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
