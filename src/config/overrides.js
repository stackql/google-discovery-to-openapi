export const resourceNameOverridesByOperationId = {
    apigee: {
        'apigee.organizations.appgroups.apps.keys.apiproducts.updateAppGroupAppKeyApiProduct' : 'apiproducts',
        'apigee.organizations.appgroups.apps.keys.updateAppGroupAppKey' : 'keys',
        'apigee.organizations.developers.apps.keys.updateDeveloperAppKey' : 'keys',
        'apigee.organizations.developers.apps.keys.apiproducts.updateDeveloperAppKeyApiProduct' : 'apiproducts',
        'apigee.organizations.apiproducts.attributes.updateApiProductAttribute' : 'attributes',
    },
    apikeys: {
        'apikeys.projects.locations.keys.getKeyString': 'key_strings',
    },
    binaryauthorization: {
        'binaryauthorization.systempolicy.getPolicy' : 'system_policy',
    },
    cloudbuild: {
        'cloudbuild.projects.locations.bitbucketServerConfigs.removeBitbucketServerConnectedRepository' : 'bitbucket_server_configs',
        'cloudbuild.projects.locations.gitLabConfigs.removeGitLabConnectedRepository' : 'gitlab_configs',
    },
    cloudidentity: {
        'cloudidentity.groups.memberships.getMembershipGraph' : 'membership_graph',
    },
    cloudtrace: {
        'cloudtrace.projects.traces.spans.createSpan' : 'spans',
    },
    container: {
        'container.projects.zones.clusters.addons' : 'clusters',
    },
    domains: {
        'domains.projects.locations.registrations.retrieveRegisterParameters' : 'registrations',
    },
    firestore: {
        'firestore.projects.databases.documents.createDocument' : 'documents',
        'firestore.projects.databases.documents.listDocuments' : 'documents',
        'firestore.projects.databases.documents.listen' : 'documents',
    },
    integrations: {
        'integrations.projects.locations.connections.getConnectionSchemaMetadata' : 'connection_schema_metadata',   
    },
    kmsinventory: {
        'kmsinventory.projects.locations.keyRings.cryptoKeys.getProtectedResourcesSummary' : 'protected_resources',
    },
    servicenetworking: {
        'servicenetworking.services.connections.deleteConnection' : 'connections',
        'servicenetworking.services.addSubnetwork' : 'subnetworks',
    },
    // accessapproval: {
    //     'accessapproval.organizations.updateAccessApprovalSettings' : 'access_approval_settings',
    //     'accessapproval.folders.updateAccessApprovalSettings' :  'access_approval_settings',
    //     'accessapproval.projects.updateAccessApprovalSettings' : 'access_approval_settings',
    // },
    // compute: {
    //     'compute.securityPolicies.aggregatedList' : 'security_policies_aggregated',
    //     'compute.backendServices.aggregatedList' : 'backend_services_aggregated',
    //     'compute.healthChecks.aggregatedList' : 'health_checks_aggregated',
    //     'compute.sslCertificates.aggregatedList' : 'ssl_certificates_aggregated',
    //     'compute.urlMaps.aggregatedList' : 'url_maps_aggregated',
    //     'compute.targetHttpProxies.aggregatedList' : 'target_http_proxies_aggregated',
    //     'compute.globalOperations.aggregatedList' : 'global_operations_aggregated',
    //     'compute.targetHttpsProxies.aggregatedList' : 'target_https_proxies_aggregated',
    // },
    // dataflow: {
    //     'dataflow.projects.jobs.aggregated' : 'jobs_aggregated',
    // },
    // osconfig: {
    //     'osconfig.projects.locations.instances.vulnerabilityReports.get' : 'vulnerability_report',
    //     'osconfig.projects.locations.instances.osPolicyAssignments.reports.get' : 'report',
    // },   
    // privateca: {
    //     'privateca.projects.locations.caPools.certificateAuthorities.fetch' : 'certificate_signing_request',
    // },
    // spanner: {
    //     'spanner.projects.instances.databases.sessions.read' : 'session_info',
    // },
    // videointelligence: {
    //     'videointelligence.operations.projects.locations.operations.cancel' : 'long_running_operations',
    //     'videointelligence.operations.projects.locations.operations.delete' : 'long_running_operations',
    //     'videointelligence.operations.projects.locations.operations.get' : 'long_running_operations',
    // },   
};

export const resourceNameOverridesByResourceName = {
    container: {
        'well-known_openid-configuration' : 'well_known_openid_configuration',
    },
    connectors: {
        'entities_entities_with_conditions' : 'entities',
    },
    contactcenteraiplatform: {
        'contact_centers_authentication-config': 'authentication_config',
    },
    iap: {
        'iap_iap_settings' : 'iap',
    },
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
