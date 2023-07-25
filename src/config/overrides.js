export const resourceNameOverridesByOperationId = {
    accessapproval: {
        'accessapproval.organizations.updateAccessApprovalSettings' : 'access_approval_settings',
        'accessapproval.folders.updateAccessApprovalSettings' :  'access_approval_settings',
        'accessapproval.projects.updateAccessApprovalSettings' : 'access_approval_settings',
    },
    compute: {
        'compute.securityPolicies.aggregatedList' : 'security_policies_aggregated',
        'compute.backendServices.aggregatedList' : 'backend_services_aggregated',
        'compute.healthChecks.aggregatedList' : 'health_checks_aggregated',
        'compute.sslCertificates.aggregatedList' : 'ssl_certificates_aggregated',
        'compute.urlMaps.aggregatedList' : 'url_maps_aggregated',
        'compute.targetHttpProxies.aggregatedList' : 'target_http_proxies_aggregated',
        'compute.globalOperations.aggregatedList' : 'global_operations_aggregated',
        'compute.targetHttpsProxies.aggregatedList' : 'target_https_proxies_aggregated',
    },
    dataflow: {
        'dataflow.projects.jobs.aggregated' : 'jobs_aggregated',
    },
    osconfig: {
        'osconfig.projects.locations.instances.vulnerabilityReports.get' : 'vulnerability_report',
        'osconfig.projects.locations.instances.osPolicyAssignments.reports.get' : 'report',
    },   
    privateca: {
        'privateca.projects.locations.caPools.certificateAuthorities.fetch' : 'certificate_signing_request',
    },
    spanner: {
        'spanner.projects.instances.databases.sessions.read' : 'session_info',
    },
    videointelligence: {
        'videointelligence.operations.projects.locations.operations.cancel' : 'long_running_operations',
        'videointelligence.operations.projects.locations.operations.delete' : 'long_running_operations',
        'videointelligence.operations.projects.locations.operations.get' : 'long_running_operations',
    },   
};

const shortenResourceName = (resourceName, prefixes, exceptions) => {

    // Check if resourceName is in exceptions
    if (exceptions.includes(resourceName)) {
        return resourceName;
    }

    // Iterate over each prefix in the prefixes array
    for (const prefix of prefixes) {

        // if resourceName === prefix, return resourceName
        if (resourceName === prefix) {
            return resourceName;
        }

        // Remove prefix from resourceName if it exists and if the resource is not <prefix>iam_policies
        if (resourceName.startsWith(prefix) && !resourceName.endsWith(`${prefix}iam_policies`)) {
            return resourceName.slice(prefix.length);
        }
    }

    // If no prefixes exist in resourceName, or the resource is <prefix>iam_policies, return resourceName as is
    return resourceName;
};

// cloudprofiler
// projects_profiles => profiles (generic)

// cloudtrace
// projects_traces => traces (generic)

// container
// projects_zones_serverconfig => serverconfig (generic) (global)

// containeranalysis
// projects_occurrences => occurrences (generic)


// cloudkms
// key_rings_import_jobs_iam_policies
// key_rings_import_jobs
// key_rings_crypto_keys_iam_policies
// key_rings_crypto_keys
// key_rings_crypto_keys_crypto_key_versions
// key_rings_crypto_keys_crypto_key_versions_public_key


export const resourceNameOverridesByResourceName = {
    accessapproval: (resource) => {
        return shortenResourceName(resource, ['folders', 'organizations', 'projects'], []);
    },
    accesscontextmanager: (resource) => {
        return shortenResourceName(resource, ['access_policies_'], []);
    },
    advisorynotifications: (resource) => {
        if(resource === 'organization_notifications'){
            return 'notifications';
        }
        return resource;
    },
    analyticshub: (resource) => {
        return shortenResourceName(resource, ['organization_', 'data_exchanges_'], []);
    },
    // apigateway: (resource) => {},
    apigee: (resource) => {
        const newResourceName = shortenResourceName(resource, ['organizations_'], []);
        switch (newResourceName) {
            case 'developersbalance': return 'developers_balance';
            case 'developersmonetization_config': return 'developers_monetization_config';
            case 'envgroupsdeployed_ingress_config': return 'envgroups_deployed_ingress_config';
            case 'environmentsapi_security_runtime_config': return 'environments_api_security_runtime_config';
            case 'environmentsdeployed_config': return 'environments_deployed_config';
            case 'environmentstrace_config': return 'environments_trace_config';
            case 'organizationsdeployed_ingress_config': return 'organizations_deployed_ingress_config';
            case 'organizationsproject_mapping': return 'organizations_project_mapping';
            case 'organizationsruntime_config': return 'organizations_runtime_config';
            case 'organizationssync_authorization': return 'organizations_sync_authorization';
            case 'developers_apps_keys_create': return 'developers_apps_keys';
            case 'environments_apis_revisions_debugsessionsdata': return 'environments_apis_revisions_debugsessions_data';
            case 'environments_apis_revisionsdeployments': return 'environments_apis_revisions_deployments';
            case 'security_profilesrevisions': return 'security_profiles_revisions';
            case 'datacollectors': return 'data_collectors';
            case 'environments_keystores_aliasescertificate': return 'environments_keystores_aliases_certificate';
            case 'environments_queriesresult': return 'environments_queries_result';
            case 'environments_queriesresulturl': return 'environments_queries_resulturl';
            case 'environments_resourcefiles': return 'environments_resource_files';
            case 'environments_resourcefilesenvironment_resources': return 'environments_resource_files_environment_resources';
            case 'environments_security_reportsresult': return 'environments_security_reports_result';
            case 'environments_security_reportsresult_view': return 'environments_security_reports_result_view';
            case 'environments_sharedflows_revisionsdeployments': return 'environments_sharedflows_revisions_deployments';
            case 'environments_targetservers': return 'environments_target_servers';
            case 'host_queriesresult': return 'host_queries_result';
            case 'host_queriesresult_view': return 'host_queries_result_view';
            case 'host_security_reportsresult': return 'host_security_reports_result';
            case 'host_security_reportsresult_view': return 'host_security_reports_result_view';
            case 'instances_canaryevaluations': return 'instances_canary_evaluations';
            case 'environmentsdebugmask': return 'environments_debugmask';
            default: return newResourceName;
        }
    },
    apigeeregistry: (resource) => {
        switch (resource) {
            case 'artifactscontents': return 'artifacts_contents';
            case 'apis_versions_artifactscontents': return 'apis_versions_artifacts_contents';
            case 'apis_versions_specs_artifactscontents': return 'apis_versions_specs_artifacts_contents';
            case 'apis_versions_specsrevision': return 'apis_versions_specs_revision';
            case 'apis_versions_specsrevisions': return 'apis_versions_specs_revisions';
            case 'apis_versions_specscontents': return 'apis_versions_specs_contents';
            case 'apis_artifactscontents': return 'apis_artifacts_contents';
            case 'apis_deploymentsrevisions': return 'apis_deployments_revisions';
            case 'apis_deploymentsrevision': return 'apis_deployments_revision';            
            case 'apis_deployments_artifactscontents': return 'apis_deployments_artifacts_contents';            
            default: return resource;
        }
    },
    apikeys: (resource) => {
        if(resource === 'keyskey_string'){
            return 'key_strings';
        }
        return resource;
    },
    appengine: (resource) => {
        return shortenResourceName(resource, ['apps_'], []);
    },
    artifactregistry: (resource) => {
        switch (resource) {
            case 'projects_locationsvpcsc_config': return 'vpcsc_config';
            case 'projectsproject_settings': return 'settings';
            default: return resource;
        }
    },
    // assuredworkloads: (resource) => {},
    baremetalsolution: (resource) => {
        switch (resource) {
            case 'networksnetwork_usage': return 'network_usage';
            default: return resource;
        }
    },
    batch: (resource) => {
        return shortenResourceName(resource, ['jobs_task_groups_'], []);
    },
    beyondcorp: (resource) => {
        return shortenResourceName(resource, ['organization_'], []);
    },
    bigquery: (resource) => {
        switch (resource) {
            case 'projectsservice_account': return 'projects_service_account';
            default: return resource;
        }        
    },
    // bigqueryconnection: (resource) => {},
    bigquerydatatransfer: (resource) => {
        const newResourceName = shortenResourceName(resource, ['projects_'], []);
        switch (newResourceName) {
            case 'transfer_configs_runs_transfer_logs': return 'transfer_logs';
            default: return newResourceName;
        }
    },
    bigqueryreservation: (resource) => {
        switch (resource) {
            case 'projects_locationsbi_reservation': return 'bi_reservations';
            default: return resource;
        }
    },
    bigtableadmin: (resource) => {
        return shortenResourceName(resource, ['projects_'], []);
    },
    billingbudgets: (resource) => {
        return shortenResourceName(resource, ['billing_accounts_'], []);
    },
    binaryauthorization: (resource) => {
        const newResourceName = shortenResourceName(resource, ['projects_'], []);
        switch (newResourceName) {
            case 'systempolicypolicy': return 'policies';
            case 'projectspolicy': return 'policies';
            default: return newResourceName;
        }
    },
    // blockchainnodeengine: (resource) => {},
    // certificatemanager: (resource) => {},
    // cloudasset: (resource) => {},
    // cloudbilling: (resource) => {},
    // cloudbuild: (resource) => {},
    // clouddebugger: (resource) => {},
    // clouddeploy: (resource) => {},
    clouderrorreporting: (resource) => {
        return shortenResourceName(resource, ['projects_'], []);
    },
    // cloudfunctions: (resource) => {},
    // cloudidentity: (resource) => {},
    // cloudkms: (resource) => {},
    // cloudprofiler: (resource) => {},
    // cloudresourcemanager: (resource) => {},
    // cloudscheduler: (resource) => {},
    // cloudshell: (resource) => {},
    // cloudsupport: (resource) => {},
    // cloudtasks: (resource) => {},
    // cloudtrace: (resource) => {},
    // composer: (resource) => {},
    // compute: (resource) => {},
    // connectors: (resource) => {},
    // contactcenteraiplatform: (resource) => {},
    // contactcenterinsights: (resource) => {},
    // container: (resource) => {},
    // containeranalysis: (resource) => {},
    // contentwarehouse: (resource) => {},
    // datacatalog: (resource) => {},
    // dataflow: (resource) => {},
    // dataform: (resource) => {},
    // datafusion: (resource) => {},
    // datalabeling: (resource) => {},
    // datalineage: (resource) => {},
    // datamigration: (resource) => {},
    // datapipelines: (resource) => {},
    // dataplex: (resource) => {},
    // dataproc: (resource) => {},
    // datastore: (resource) => {},
    // datastream: (resource) => {},
    // deploymentmanager: (resource) => {},
    // dialogflow: (resource) => {},
    // discoveryengine: (resource) => {},
    // dlp: (resource) => {},
    // dns: (resource) => {},
    // documentai: (resource) => {},
    // domains: (resource) => {},
    // essentialcontacts: (resource) => {},
    // eventarc: (resource) => {},
    // fcm: (resource) => {},
    // fcmdata: (resource) => {},
    // file: (resource) => {},
    // firebase: (resource) => {},
    // firebaseappcheck: (resource) => {},
    // firebaseappdistribution: (resource) => {},
    // firebasedatabase: (resource) => {},
    // firebaseml: (resource) => {},
    // firebaserules: (resource) => {},
    // firebasestorage: (resource) => {},
    // firestore: (resource) => {},
    // gameservices: (resource) => {},
    // gkebackup: (resource) => {},
    // gkehub: (resource) => {},
    // gkeonprem: (resource) => {},
    // healthcare: (resource) => {},
    // iam: (resource) => {},
    // iamcredentials: (resource) => {},
    // iap: (resource) => {},
    // identitytoolkit: (resource) => {},
    // ids: (resource) => {},
    // integrations: (resource) => {},
    // jobs: (resource) => {},
    // kmsinventory: (resource) => {},
    // language: (resource) => {},
    // libraryagent: (resource) => {},
    // lifesciences: (resource) => {},
    // logging: (resource) => {},
    // managedidentities: (resource) => {},
    // memcache: (resource) => {},
    // metastore: (resource) => {},
    // migrationcenter: (resource) => {},
    // ml: (resource) => {},
    // monitoring: (resource) => {},
    // networkconnectivity: (resource) => {},
    // networkmanagement: (resource) => {},
    // networksecurity: (resource) => {},
    // networkservices: (resource) => {},
    // notebooks: (resource) => {},
    // ondemandscanning: (resource) => {},
    // orgpolicy: (resource) => {},
    // osconfig: (resource) => {},
    // oslogin: (resource) => {},
    // places: (resource) => {},
    // policyanalyzer: (resource) => {},
    // policysimulator: (resource) => {},
    // policytroubleshooter: (resource) => {},
    // privateca: (resource) => {},
    // prod_tt_sasportal: (resource) => {},
    // publicca: (resource) => {},
    // pubsub: (resource) => {},
    // pubsublite: (resource) => {},
    // recaptchaenterprise: (resource) => {},
    // recommendationengine: (resource) => {},
    // recommender: (resource) => {},
    // redis: (resource) => {},
    // resourcesettings: (resource) => {},
    // retail: (resource) => {},
    // run: (resource) => {},
    // runtimeconfig: (resource) => {},
    // sasportal: (resource) => {},
    // secretmanager: (resource) => {},
    // securitycenter: (resource) => {},
    // serviceconsumermanagement: (resource) => {},
    // servicecontrol: (resource) => {},
    // servicedirectory: (resource) => {},
    // servicemanagement: (resource) => {},
    // servicenetworking: (resource) => {},
    // serviceusage: (resource) => {},
    // sourcerepo: (resource) => {},
    // spanner: (resource) => {},
    // speech: (resource) => {},
    // sqladmin: (resource) => {},
    // storage: (resource) => {},
    // storagetransfer: (resource) => {},
    // testing: (resource) => {},
    // texttospeech: (resource) => {},
    // toolresults: (resource) => {},
    // tpu: (resource) => {},
    // trafficdirector: (resource) => {},
    // transcoder: (resource) => {},
    // translate: (resource) => {},
    // videointelligence: (resource) => {},
    // vision: (resource) => {},
    // vmmigration: (resource) => {},
    // vpcaccess: (resource) => {},
    // webrisk: (resource) => {},
    // websecurityscanner: (resource) => {},
    // workflowexecutions: (resource) => {},
    // workflows: (resource) => {},
    // workloadmanager: (resource) => {},
    // workstations: (resource) => {},
};



export const sqlVerbOverrides = {
    dataform: {
        'dataform.projects.locations.repositories.workspaces.readFile' : 'exec',        
    },
    documentai: {
        'documentai.projects.locations.fetchProcessorTypes' : 'exec',        
    },
};
