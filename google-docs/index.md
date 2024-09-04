---
title: google
hide_title: false
hide_table_of_contents: false
keywords:
  - google
  - google cloud platform
  - stackql
  - infrastructure-as-code
  - configuration-as-data
  - cloud inventory
description: Query, deploy and manage Google Cloud Platform resources using SQL
custom_edit_url: null
image: /img/providers/google/stackql-google-provider-featured-image.png
id: google-doc
slug: /providers/google

---

import CopyableCode from '@site/src/components/CopyableCode/CopyableCode';

Cloud services from Google.

:::info Provider Summary (v24.07.00244)

<div class="row">
<div class="providerDocColumn">
<span>total services:&nbsp;<b>167</b></span><br />
<span>total resources:&nbsp;<b>1</b></span><br />
</div>
</div>

:::

See also:   
[[` SHOW `]](https://stackql.io/docs/language-spec/show) [[` DESCRIBE `]](https://stackql.io/docs/language-spec/describe)  [[` REGISTRY `]](https://stackql.io/docs/language-spec/registry)
* * * 

## Installation

To pull the latest version of the `google` provider, run the following command:  

```bash
REGISTRY PULL google;
```
> To view previous provider versions or to pull a specific provider version, see [here](https://stackql.io/docs/language-spec/registry).  

## Authentication


The following authentication methods are supported:
- <CopyableCode code="service_account" />
- <CopyableCode code="interactive" /> for running interactive queries from Cloud Shell or other machines where the user is authenticated using <CopyableCode code="gcloud auth login" />

> for more information on creating service accounts and key files, see [Service accounts overview](https://cloud.google.com/iam/docs/service-account-overview).

### Service Account Environment Variable (default)

The following system environment variable is used by default:  

- <CopyableCode code="GOOGLE_CREDENTIALS" /> - contents of the <code>google</code> service account key json file.  This variable is sourced at runtime (from the local machine using <code>export GOOGLE_CREDENTIALS=cat creds/my-sa-key.json</code> for example or as a CI variable/secret).

This variable is sourced at runtime (from the local machine using `export GOOGLE_CREDENTIALS=$(cat creds/my-sa-key.json)` for example or as a CI variable/secret).

<details>

<summary>Specifying the service account key file location directly</summary>

You can specify the path to the service account key file without using the default environment variable by using the <CopyableCode code="--auth" /> flag of the <code>stackql</code> program.  For example:  

```bash
AUTH='{ "google": { "type": "service_account",  "credentialsfilepath": "creds/sa-key.json" }}'
stackql shell --auth="${AUTH}"
```

or using PowerShell:  

```powershell
$Auth = "{ 'google': { 'type': 'service_account',  'credentialsfilepath': 'creds/sa-key.json' }}"
stackql.exe shell --auth=$Auth
```

</details>

### Interactive Authentication
When you are using Google Cloud Shell or on a machine where you have authenticated using <CopyableCode code="gcloud auth login" />, you can then use the following authentication method:   

```bash
AUTH='{ "google": { "type": "interactive" }}'
stackql shell --auth="${AUTH}"
```

or using PowerShell:  

```powershell
$Auth = "{ 'google': { 'type': 'interactive' }}"
stackql.exe shell --auth=$Auth
```

## Services
<div class="row">
<div class="providerDocColumn">
<a href="/providers/google/accessapproval/">accessapproval</a><br />
<a href="/providers/google/accesscontextmanager/">accesscontextmanager</a><br />
<a href="/providers/google/addressvalidation/">addressvalidation</a><br />
<a href="/providers/google/advisorynotifications/">advisorynotifications</a><br />
<a href="/providers/google/aiplatform/">aiplatform</a><br />
<a href="/providers/google/airquality/">airquality</a><br />
<a href="/providers/google/alloydb/">alloydb</a><br />
<a href="/providers/google/analyticshub/">analyticshub</a><br />
<a href="/providers/google/apigateway/">apigateway</a><br />
<a href="/providers/google/apigee/">apigee</a><br />
<a href="/providers/google/apigeeregistry/">apigeeregistry</a><br />
<a href="/providers/google/apikeys/">apikeys</a><br />
<a href="/providers/google/apim/">apim</a><br />
<a href="/providers/google/appengine/">appengine</a><br />
<a href="/providers/google/apphub/">apphub</a><br />
<a href="/providers/google/artifactregistry/">artifactregistry</a><br />
<a href="/providers/google/assuredworkloads/">assuredworkloads</a><br />
<a href="/providers/google/backupdr/">backupdr</a><br />
<a href="/providers/google/baremetalsolution/">baremetalsolution</a><br />
<a href="/providers/google/batch/">batch</a><br />
<a href="/providers/google/beyondcorp/">beyondcorp</a><br />
<a href="/providers/google/biglake/">biglake</a><br />
<a href="/providers/google/bigquery/">bigquery</a><br />
<a href="/providers/google/bigqueryconnection/">bigqueryconnection</a><br />
<a href="/providers/google/bigquerydatapolicy/">bigquerydatapolicy</a><br />
<a href="/providers/google/bigquerydatatransfer/">bigquerydatatransfer</a><br />
<a href="/providers/google/bigqueryreservation/">bigqueryreservation</a><br />
<a href="/providers/google/bigtableadmin/">bigtableadmin</a><br />
<a href="/providers/google/billingbudgets/">billingbudgets</a><br />
<a href="/providers/google/binaryauthorization/">binaryauthorization</a><br />
<a href="/providers/google/blockchainnodeengine/">blockchainnodeengine</a><br />
<a href="/providers/google/certificatemanager/">certificatemanager</a><br />
<a href="/providers/google/cloudasset/">cloudasset</a><br />
<a href="/providers/google/cloudbilling/">cloudbilling</a><br />
<a href="/providers/google/cloudbuild/">cloudbuild</a><br />
<a href="/providers/google/cloudcommerceprocurement/">cloudcommerceprocurement</a><br />
<a href="/providers/google/cloudcontrolspartner/">cloudcontrolspartner</a><br />
<a href="/providers/google/clouddeploy/">clouddeploy</a><br />
<a href="/providers/google/clouderrorreporting/">clouderrorreporting</a><br />
<a href="/providers/google/cloudfunctions/">cloudfunctions</a><br />
<a href="/providers/google/cloudidentity/">cloudidentity</a><br />
<a href="/providers/google/cloudkms/">cloudkms</a><br />
<a href="/providers/google/cloudprofiler/">cloudprofiler</a><br />
<a href="/providers/google/cloudresourcemanager/">cloudresourcemanager</a><br />
<a href="/providers/google/cloudscheduler/">cloudscheduler</a><br />
<a href="/providers/google/cloudshell/">cloudshell</a><br />
<a href="/providers/google/cloudsupport/">cloudsupport</a><br />
<a href="/providers/google/cloudtasks/">cloudtasks</a><br />
<a href="/providers/google/cloudtrace/">cloudtrace</a><br />
<a href="/providers/google/composer/">composer</a><br />
<a href="/providers/google/compute/">compute</a><br />
<a href="/providers/google/config/">config</a><br />
<a href="/providers/google/connectors/">connectors</a><br />
<a href="/providers/google/contactcenteraiplatform/">contactcenteraiplatform</a><br />
<a href="/providers/google/contactcenterinsights/">contactcenterinsights</a><br />
<a href="/providers/google/container/">container</a><br />
<a href="/providers/google/containeranalysis/">containeranalysis</a><br />
<a href="/providers/google/contentwarehouse/">contentwarehouse</a><br />
<a href="/providers/google/datacatalog/">datacatalog</a><br />
<a href="/providers/google/dataflow/">dataflow</a><br />
<a href="/providers/google/dataform/">dataform</a><br />
<a href="/providers/google/datafusion/">datafusion</a><br />
<a href="/providers/google/datalabeling/">datalabeling</a><br />
<a href="/providers/google/datalineage/">datalineage</a><br />
<a href="/providers/google/datamigration/">datamigration</a><br />
<a href="/providers/google/datapipelines/">datapipelines</a><br />
<a href="/providers/google/dataplex/">dataplex</a><br />
<a href="/providers/google/dataproc/">dataproc</a><br />
<a href="/providers/google/datastore/">datastore</a><br />
<a href="/providers/google/datastream/">datastream</a><br />
<a href="/providers/google/deploymentmanager/">deploymentmanager</a><br />
<a href="/providers/google/developerconnect/">developerconnect</a><br />
<a href="/providers/google/dialogflow/">dialogflow</a><br />
<a href="/providers/google/discoveryengine/">discoveryengine</a><br />
<a href="/providers/google/dlp/">dlp</a><br />
<a href="/providers/google/dns/">dns</a><br />
<a href="/providers/google/documentai/">documentai</a><br />
<a href="/providers/google/domains/">domains</a><br />
<a href="/providers/google/essentialcontacts/">essentialcontacts</a><br />
<a href="/providers/google/eventarc/">eventarc</a><br />
<a href="/providers/google/file/">file</a><br />
<a href="/providers/google/firestore/">firestore</a><br />
<a href="/providers/google/gkebackup/">gkebackup</a><br />
<a href="/providers/google/gkehub/">gkehub</a><br />
</div>
<div class="providerDocColumn">
<a href="/providers/google/gkeonprem/">gkeonprem</a><br />
<a href="/providers/google/healthcare/">healthcare</a><br />
<a href="/providers/google/iam/">iam</a><br />
<a href="/providers/google/iamcredentials/">iamcredentials</a><br />
<a href="/providers/google/iamv2/">iamv2</a><br />
<a href="/providers/google/iamv2beta/">iamv2beta</a><br />
<a href="/providers/google/iap/">iap</a><br />
<a href="/providers/google/identitytoolkit/">identitytoolkit</a><br />
<a href="/providers/google/ids/">ids</a><br />
<a href="/providers/google/integrations/">integrations</a><br />
<a href="/providers/google/jobs/">jobs</a><br />
<a href="/providers/google/kmsinventory/">kmsinventory</a><br />
<a href="/providers/google/language/">language</a><br />
<a href="/providers/google/libraryagent/">libraryagent</a><br />
<a href="/providers/google/lifesciences/">lifesciences</a><br />
<a href="/providers/google/logging/">logging</a><br />
<a href="/providers/google/looker/">looker</a><br />
<a href="/providers/google/managedidentities/">managedidentities</a><br />
<a href="/providers/google/memcache/">memcache</a><br />
<a href="/providers/google/metastore/">metastore</a><br />
<a href="/providers/google/migrationcenter/">migrationcenter</a><br />
<a href="/providers/google/ml/">ml</a><br />
<a href="/providers/google/monitoring/">monitoring</a><br />
<a href="/providers/google/networkconnectivity/">networkconnectivity</a><br />
<a href="/providers/google/networkmanagement/">networkmanagement</a><br />
<a href="/providers/google/networksecurity/">networksecurity</a><br />
<a href="/providers/google/networkservices/">networkservices</a><br />
<a href="/providers/google/notebooks/">notebooks</a><br />
<a href="/providers/google/ondemandscanning/">ondemandscanning</a><br />
<a href="/providers/google/orgpolicy/">orgpolicy</a><br />
<a href="/providers/google/osconfig/">osconfig</a><br />
<a href="/providers/google/oslogin/">oslogin</a><br />
<a href="/providers/google/places/">places</a><br />
<a href="/providers/google/policyanalyzer/">policyanalyzer</a><br />
<a href="/providers/google/policysimulator/">policysimulator</a><br />
<a href="/providers/google/policytroubleshooter/">policytroubleshooter</a><br />
<a href="/providers/google/pollen/">pollen</a><br />
<a href="/providers/google/privateca/">privateca</a><br />
<a href="/providers/google/prod_tt_sasportal/">prod_tt_sasportal</a><br />
<a href="/providers/google/publicca/">publicca</a><br />
<a href="/providers/google/pubsub/">pubsub</a><br />
<a href="/providers/google/pubsublite/">pubsublite</a><br />
<a href="/providers/google/rapidmigrationassessment/">rapidmigrationassessment</a><br />
<a href="/providers/google/recaptchaenterprise/">recaptchaenterprise</a><br />
<a href="/providers/google/recommendationengine/">recommendationengine</a><br />
<a href="/providers/google/recommender/">recommender</a><br />
<a href="/providers/google/redis/">redis</a><br />
<a href="/providers/google/resourcesettings/">resourcesettings</a><br />
<a href="/providers/google/retail/">retail</a><br />
<a href="/providers/google/run/">run</a><br />
<a href="/providers/google/runtimeconfig/">runtimeconfig</a><br />
<a href="/providers/google/sasportal/">sasportal</a><br />
<a href="/providers/google/secretmanager/">secretmanager</a><br />
<a href="/providers/google/securitycenter/">securitycenter</a><br />
<a href="/providers/google/serviceconsumermanagement/">serviceconsumermanagement</a><br />
<a href="/providers/google/servicecontrol/">servicecontrol</a><br />
<a href="/providers/google/servicedirectory/">servicedirectory</a><br />
<a href="/providers/google/servicemanagement/">servicemanagement</a><br />
<a href="/providers/google/servicenetworking/">servicenetworking</a><br />
<a href="/providers/google/serviceusage/">serviceusage</a><br />
<a href="/providers/google/solar/">solar</a><br />
<a href="/providers/google/spanner/">spanner</a><br />
<a href="/providers/google/speech/">speech</a><br />
<a href="/providers/google/sqladmin/">sqladmin</a><br />
<a href="/providers/google/storage/">storage</a><br />
<a href="/providers/google/storagetransfer/">storagetransfer</a><br />
<a href="/providers/google/testing/">testing</a><br />
<a href="/providers/google/texttospeech/">texttospeech</a><br />
<a href="/providers/google/tpu/">tpu</a><br />
<a href="/providers/google/trafficdirector/">trafficdirector</a><br />
<a href="/providers/google/transcoder/">transcoder</a><br />
<a href="/providers/google/translate/">translate</a><br />
<a href="/providers/google/videointelligence/">videointelligence</a><br />
<a href="/providers/google/vision/">vision</a><br />
<a href="/providers/google/vmmigration/">vmmigration</a><br />
<a href="/providers/google/vmwareengine/">vmwareengine</a><br />
<a href="/providers/google/vpcaccess/">vpcaccess</a><br />
<a href="/providers/google/webrisk/">webrisk</a><br />
<a href="/providers/google/websecurityscanner/">websecurityscanner</a><br />
<a href="/providers/google/workflowexecutions/">workflowexecutions</a><br />
<a href="/providers/google/workflows/">workflows</a><br />
<a href="/providers/google/workloadmanager/">workloadmanager</a><br />
<a href="/providers/google/workstations/">workstations</a><br />
</div>
</div>
