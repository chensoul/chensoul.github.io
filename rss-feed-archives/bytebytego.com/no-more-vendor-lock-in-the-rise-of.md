Cloud computing has unleashed a wave of innovation, powering industry giants like Netflix, Airbnb, and countless others. Yet despite its promise, cloud's full potential remains constrained, locked within vendor-specific silos. What if you could break free from these limitations? Imagine an open sky above the clouds, where your applications can freely soar and shift between clouds at will. This vision is now within reach. The next evolutionary leap beyond cloud computing is showing great promise - welcome to the era of Sky Computing.

In Sky Computing, applications are not bound to any single cloud provider. You can develop cloud-agnostic applications and optimize for performance, cost, latency - on your terms. Initial implementations have already shown the immense benefits, from cutting costs in half to being able to run high-throughput batch workloads across clouds. With open frameworks replacing vendor lock-in, the possibilities are endless. Join us as we explore how Sky Computing works, the promising benefits it unlocks, and how you can start soaring beyond the limits of cloud today.

Sky Computing relies on key technical abstractions that intelligently distribute workloads across diverse cloud environments. Initial open source implementations like SkyPilot and SkyPlane demonstrate the viability of these concepts. They provide a seamless multi-cloud experience, while optimizing for cost, performance and latency based on application needs.

In this issue, we will:

+   Analyze the incentives for cloud providers and users to participate in this next wave of innovation
    
+   Examine how early pioneering innovations in Sky Computing are already demonstrating promising benefits
    
+   Outline an action plan for you to start experimenting with these architectures - unlocking the promise of an open sky above the clouds
    

## Cloud Computing Landscape Today

The following illustration shows how most applications use cloud computing today.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F839a228e-ba45-44ed-973f-7dcd9610ead7_1600x1600.png)



Most applications today use just one cloud

The following illustration shows what sky computing promises us and its three main enablers—(1) job specification by apps, (2) inter-cloud abstraction layer, and (3) network peering between the clouds.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F6bc5cf9d-19ca-4ed4-96d3-44fd9a030075_1600x1600.png)



Sky computing makes applications cloud provider agnostic by using three primary enablers (numbered in the above diagram)

Let’s first understand the reasons why many applications depend on one cloud provider.

## Why do most applications rely on just one cloud today?

Most cloud applications today utilize one of the major cloud providers. Applications built in this manner are tightly coupled with the underlying cloud provider’s API. In a sense, such applications are silos—they cannot easily transition from one cloud to another. Organizations choose cloud providers—often for multiple years—that serve their current and future needs at a favorable cost. The cloud providers frequently leverage such opportunities to lock in customers they believe will be profitable. Here are some common reasons why many applications opt for a single cloud provider:

1.  **Simplicity and ease of management:** Using a single cloud provider can streamline the management and operation of an application. Organizations only have to deal with one set of tools, one billing platform, and one set of resources to manage, which can reduce complexity and overhead. For many organizations such as start-ups, keep technical complexity and associated risks in check is imperative for survival.
    
2.  **Cost considerations:** Adhering to a single cloud provider can make it easier to predict and control costs. Each cloud provider has its pricing model, and managing multiple providers can be more challenging for optimizing cost efficiency.
    
    Predicting pricing in a cloud provider’s spot market can be challenging due to high price and availability fluctuations. Some models even treat such spot markets as stock exchanges and use those models for prediction. According to [one study](https://www.cnbc.com/2019/04/22/apple-spends-more-than-30-million-on-amazon-web-services-a-month.html), Apple spent more than $30 million a month in 2019 at AWS for iCloud storage, based on a multi-year contract between the two companies. Large customers like Apple have substantial leverage to negotiate prices.
    
    Often cloud providers can offer subsidized rates for organizations if they commit to staying with the provider for many years. Such deals are seen as a win-win - the customers get their computing done at a competitive price, and the cloud provider secures important long-term customers. However, once agreed-upon, the customer is locked into that specific provider on the agreed-upon terms.
    
    For an organization, architecting an application to run on multiple cloud providers can be *n* times as costly (where n is the number of clouds supported) in terms of required technical expertise, training, business deal negotiations, and challenges debugging and fixing issues.
    
3.  **Integration and compatibility:** Cloud providers offer a wide range of services and tools. By using one provider's ecosystem, it's often easier to ensure seamless integration between services, which can improve application performance and reliability.
    
4.  **Service differentiation:** Some cloud providers excel in specific areas or industries. If an application has particular requirements that align well with a provider's strengths (e.g., AWS for ARM-based virtual machines for lower cost, Azure for enterprise integration with Microsoft-specific solutions, GCP for globally distributed, transactional Spanner database, etc.), it may make sense to use that provider.
    
5.  **Data gravity:** Applications that deal with massive data volumes often find it more efficient to keep their data within one cloud provider's ecosystem due to data transfer costs, latency, and compliance considerations.
    
    Even if a customer did not get a special volume discount, most cloud providers make it harder to move data out (while data ingress rates are often much lower compared to egress). Additionally, artificial throttling limits might be in place to slow egress throughput. For example, a [recent study](https://www.usenix.org/system/files/nsdi23-jain.pdf) showed that AWS throttled egress data at 5 Gbps.
    
6.  **Technical expertise:** Teams may have specialized expertise with a specific cloud provider's services and tools, making it more efficient to continue using that provider for new projects.
    

Some customers operate on very slim profit margins and are highly cost-sensitive. So much so that at times, some applications choose the cheapest data center among many while ignoring redundancy. For example, AWS’s North Virginia’s datacenter is the most affordable for some services, so they only deploy there. However, there is an inherent risk of failure when a data center-wide outage occurs, as has happened in the past. Still, many customers seem to ignore such risks because cloud providers have become very reliable over the years. Some organizations are willing to take this gamble. 

```auto
An aside: Artificial fault injection to keep the clients honest to the SLA

As an interesting aside, Google reports artificially inducing errors to its Chubby locking service so internal customers don’t start believing Chubby has 100% availability. Such practices are not usually employed for public facing services.
```

7.  **Vendor Lock-In:** Inertia exists in computing as well—as an organization’s footprint grows within a cloud provider, it becomes increasingly difficult to switch providers. 
    
    While vendor lock-in can be a concern with a single cloud provider, some organizations prioritize short-term efficiency over long-term flexibility. They may opt to address potential lock-in issues later, once their application matures. However, that moment may never arrive as applications and workloads can become further intertwined with proprietary APIs over time.
    

```auto
An aside: Multi-cloud and Sky computing

Some organizations use more than one cloud, either for distinct, unrelated applications or different business units. This strategy is also called multi-cloud. For our discussion, we will consider an application’s ability to freely transition across any cloud as either multi-cloud or sky computing.
```

Ultimately, the decision to use one or multiple cloud providers should be based on the application’s specific needs and goals, as well as the organization's tolerance for complexity and risk.

## Why would anyone want Sky Computing?

The obvious question is: why would anyone want Sky Computing to happen? What incentives exist for stakeholders?

Multi-cloud architectures, where applications utilize multiple cloud providers simultaneously, offer several benefits depending on an organization’s specific needs and goals. Here are some of the key incentives and benefits of multi-cloud apps:

1.  **Redundancy and high availability:** Spreading workloads across multiple cloud providers and regions enhances the application redundancy and high availability. If one cloud provider experiences an outage, the application can seamlessly failover to another, minimizing downtime and ensuring business continuity.  
    Recent events demonstrate that cloud provider outages happen. Applications that dynamically move workloads between providers can mask an outage.
    
2.  **Risk mitigation:** Multi-cloud strategies mitigate vendor lock-in risks. Organizations avoid over-reliance on a single provider, reducing vulnerability to changes in pricing, service quality, or strategic shifts by a single provider.
    
3.  **Optimization for specific services:** Different cloud providers excel in different areas. By using multiple providers, organizations can choose the best services for each sub-task within their application. For example, one provider may offer superior machine learning solutions while another excels at IoT or analytics services.
    

There will always be differentiated services among cloud providers. Later we will examine an example ML pipeline where each stage runs on a different cloud.

The following illustration shows a workload with three major phases—data processing, ML training, and client serving. We might figure that Azure’s secure processing service is the best choice for the first phase (data processing), GCP’s TPU processors can give us superior performance per dollar for the second phase (ML training), while we can serve economically using AWS Inferentia service for the third phase (client serving). The output of one phase provides the input to the next by utilizing egress routes. Prototyping confirmed that this approach reduced costs up to 80% and latency up to 60% compared to using a single cloud.



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2Fba4adc89-c24b-48da-bde4-89f30c43f56e_1600x1600.png)



Data processing, ML training, and data serving using three cloud providers.

4.  **Cost optimization:** Multi-cloud deployments allow organizations to optimize costs by selecting the most cost-effective cloud provider for each workload. This can lead to potential cost savings, as different providers may offer better pricing for specific services or regions. 
    

```auto
An aside: Sky computing / Multi-cloud provides economic benefits and accelerates innovation.

Initial studies (see Skypilot and Skyplane) suggest substantial cost savings using multiple cloud providers, even after taking egress fees into account.
```

Not every organization gets volume discounts—those are reserved for a select few. For others, it often makes sense to move services between cloud providers. Overall costs can still be lower, even after factoring in data egress fees. We will examine those results later in this newsletter.

Spot market price and availability fluctuations also differ among cloud providers—at different times spot markets of different cloud providers might offer better cost performance.

5.  **Compliance and data sovereignty:** Compliance requirements vary by region and industry. Multi-cloud strategies enable organizations to place data and workloads in specific geographic regions to meet compliance and data sovereignty requirements. For example, some countries in the European Union might demand that data placement and processing of its citizens must happen inside the physical boundaries of the country. A single cloud provider might not have its data center in a specific country. Using another cloud provider for that country can resolve the issue.
    
6.  **Performance optimization:** Geographical distribution across cloud providers can improve application performance for users in different parts of the world. Organizations can strategically place resources closer to their end-users to reduce latency and enhance user experience.
    
7.  **Disaster recovery:** Multi-cloud architectures can simplify disaster recovery planning. If a disaster affects one provider, failover to another ensures availability.
    
8.  **Innovation and best-of-breed solutions:** Organizations can leverage innovations and best-of-breed solutions from multiple providers, staying competitive and capitalizing on emerging technologies.
    
9.  **Flexibility and scalability:** Multi-cloud environments offer greater flexibility and scalability. Organizations can scale resources as needed, avoiding the constraints of a single provider's resource limits.
    
    By leveraging sky computing, a customer has the ability to pool resources from multiple cloud providers to get their work done. For example, with GPU shortages, for many ML training sessions, we could combine GPUs from multiple cloud providers to get our work done instead of waiting for the resources to be available.
    
10.  **Negotiating leverage:** Using multiple cloud providers may provide negotiating leverage with pricing and service agreements. Competition between providers can lead to better terms for customers.
        
    The decision to adopt a multi-cloud approach should align with an organization's specific goals, requirements, and resources. It's not necessarily the right choice for every application, but it can provide significant advantages in the right circumstances.
    

## Incentives for cloud providers

Cloud providers have incentives to embrace the multi-cloud paradigm, as it can increase customer engagement and revenue opportunities. Here are some of the key incentives and benefits for cloud providers:

1.  **Increased market share:** When clients adopt a multi-cloud strategy, they are more likely to use services from multiple cloud providers. Cloud providers can capture a larger share of the market by offering services that cater to different aspects of the clients’ multi-cloud architecture.
    
2.  **Revenue diversification:** By providing services that support multi-cloud deployments, cloud providers can diversify their revenue streams. This reduces their reliance on any one client or market segment. This makes them more resilient to market fluctuations.
    
3.  **Cross-selling and up-selling:** Cloud providers can cross-sell and up-sell additional services to clients who embrace a multi-cloud strategy. For example, they can offer tools and services for managing multi-cloud environments, security solutions, and data integration services to clients. For example, GCP’s [Anthos](https://cloud.google.com/anthos/clusters/docs/multi-cloud) and Azure’s [Arc](https://azure.microsoft.com/en-us/products/azure-arc) projects are a step in that direction. 
    
4.  **Partnerships and ecosystem expansion:** Cloud providers can establish partnerships with other cloud providers or technology vendors to create a more extensive ecosystem. These partnerships can lead to joint marketing and revenue-sharing opportunities. For example, GCP’s Anthos collaborates with VMware and HP to enable Anthos across providers.
    
5.  **Customization and flexibility:** Offering customizable solutions that cater to a client's multi-cloud needs allows cloud providers to differentiate themselves in the market. Clients often seek providers who can adapt to their unique requirements.
    
6.  **Resource optimization:** Cloud providers can optimize their infrastructure and resource allocation based on client demand for multi-cloud solutions. This optimization can lead to cost savings and better resource utilization.
    
7.  **Innovation and competitive advantage:** Cloud providers that invest in multi-cloud capabilities and technologies can gain a competitive advantage by staying at the forefront of innovation in this evolving space. This can attract more clients looking for cutting-edge solutions.
    

It's important to note that while there are benefits for cloud providers, embracing the multi-cloud paradigm also presents challenges, including increased competition and the need to ensure interoperability with other cloud providers. To be successful in this space, cloud providers must continually adapt their offerings to meet the evolving needs of multi-cloud clients and maintain a strong focus on customer satisfaction.

In the ever-evolving cloud market, [no single player is too currently big](https://www.statista.com/chart/18819/worldwide-market-share-of-leading-cloud-infrastructure-service-providers/) (AWS’s share 32%, Azure’s 22%, and GCP’s 11%.), and smaller providers will be more willing to embrace sky computing than the large players. Once again projects like Anthos and Arc from GCP and Azure are an example for such a phenomenon.

```auto
An aside: John McCarthy’s vision of computing becoming a public utility.

“Computing may someday be organized as a public utility just as the telephone system is a public utility, … Each subscriber needs to pay only for the capacity he actually uses, but he has access to all programming languages characteristic of a very large system … Certain subscribers might offer service to other subscribers … The computer utility could become the basis of a new and important industry.”

A quote by Professor John McCarthy at MIT’s centennial celebration in 1961

John McCarthy (the Turing award winner of 1971 for his contributions to AI) had the vision of computing becoming a public utility where customers could use as much of it as needed and pay only for the time they used the resources. The invention of public cloud circa 2006 popularized part of McCarth’s vision where clouds provide huge resources where customer pay-per-use. However, computing becoming a public utility has yet to be realized. Just like we can plug our devices to wall sockets without worrying which electric company produced the power, we need applications that could use the infra and services without worrying which cloud provider is offering it, as long as that offering meets customer’s needs.

Cloud providers might be averse to the idea of them becoming easily replaceable by anyone else. Each large cloud tries hard to differentiate itself by offering something unique—GCP has TPUs (Tensor Processing Unit) that have better cost-performance for ML training, AWS has low cost, ARM-based virtual machines and AWS Inferentia for economical deep learning inference, and Azure has services like secure enclaves for processing sensitive data.
```

Let’s now see how organizations can architect sky computing.

## How we will realize Sky Computing

Now let's put our designer hats on. How would we architect Sky Computing to meet our stated goals? There are a few options to meet our stated goals, though only one good choice emerges.

1.  Porting each application to every cloud provider is an impractical m x n solution. With m providers and n applications, each application must conform to every cloud's unique API. For example, Databricks reportedly required many person-years of effort just to port their application to Azure. Only a few large organizations could afford this for a handful of major cloud providers.
    



![](https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2fdd277c-07dd-448f-a238-e761e20b111e_1600x1600.png)



Porting each app to every cloud provider. Databricks took tens of person-years to port it to Azure.